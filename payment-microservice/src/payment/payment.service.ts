import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { PaymentDto } from './dtos/payment.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PaymentService {
  private stripe: Stripe;

  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy,
    private readonly configService: ConfigService,
  ) {
    this.stripe = new Stripe(configService.get('STRIPE_SECRET_KEY'));
  }

  async createPayment(payment: PaymentDto) {
    const user = await lastValueFrom(
      this.natsClient.send('getUserById', payment.userId),
    );

    if (!user) {
      throw new BadRequestException('User not found');
    }

    try {
      // Create a checkout session
      const session = await this.stripe.checkout.sessions.create({
        line_items: [
          {
            price_data: {
              currency: payment.currency,
              product_data: {
                name: payment.description || 'Product Purchase',
                description: payment.description,
              },
              unit_amount: Math.round(payment.amount * 100), // Amount in cents
            },
            quantity: payment.quantity,
          },
        ],
        mode: 'payment',
        success_url: `${this.configService.get<string>('CLIENT_URL')}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${this.configService.get<string>('CLIENT_URL')}/payment/cancel`,
        metadata: {
          userId: payment.userId,
          paymentId: '', // Will be populated after saving to DB
        },
      });

      // Create and save payment record
      const newPayment = this.paymentRepository.create({
        ...payment,
        stripeSessionId: session.id,
        status: 'pending',
      });

      const savedPayment = await this.paymentRepository.save(newPayment);

      // Update session metadata with payment ID
      await this.stripe.checkout.sessions.update(session.id, {
        metadata: {
          ...session.metadata,
          paymentId: savedPayment.id,
        },
      });

      return {
        url: session.url,
        sessionId: session.id,
        paymentId: savedPayment.id,
      };
    } catch (err: any) {
      throw new BadRequestException(`Payment creation failed: ${err.message}`);
    }
  }

  async handleWebhook(event: Stripe.Event) {
    const webhookSecret = this.configService.get<string>(
      'STRIPE_WEBHOOK_SECRET',
    );

    if (!webhookSecret) {
      throw new BadRequestException('Stripe webhook secret is not configured');
    }
    try {
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object as Stripe.Checkout.Session;
          await this.handleCompletedCheckout(session);
          break;
        }

        case 'payment_intent.succeeded': {
          const paymentIntent = event.data.object as Stripe.PaymentIntent;
          await this.handleSucceededPaymentIntent(paymentIntent);
          break;
        }

        case 'payment_intent.payment_failed': {
          const paymentIntent = event.data.object as Stripe.PaymentIntent;
          await this.handleFailedPaymentIntent(paymentIntent);
          break;
        }

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      return { success: true };
    } catch (err) {
      console.error('Webhook error:', err.message);
      throw new BadRequestException('Webhook verification failed');
    }
  }

  private async handleCompletedCheckout(session: Stripe.Checkout.Session) {
    const paymentId = session.metadata?.paymentId;

    if (!paymentId) {
      console.error('No payment ID found in session metadata');
      return;
    }

    // Update payment status to completed
    await this.paymentRepository.update(
      { id: paymentId },
      {
        status: 'completed',
        updatedAt: new Date(),
      },
    );

    // Emit payment completed event
    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId },
    });

    if (payment) {
      this.natsClient.emit('payment_completed', payment);
    }
  }

  private async handleSucceededPaymentIntent(
    paymentIntent: Stripe.PaymentIntent,
  ) {
    // You might need to lookup the session to get the paymentId
    const sessions = await this.stripe.checkout.sessions.list({
      payment_intent: paymentIntent.id,
    });

    if (sessions.data.length > 0) {
      const session = sessions.data[0];
      await this.handleCompletedCheckout(session);
    }
  }

  private async handleFailedPaymentIntent(paymentIntent: Stripe.PaymentIntent) {
    const sessions = await this.stripe.checkout.sessions.list({
      payment_intent: paymentIntent.id,
    });

    if (sessions.data.length > 0) {
      const session = sessions.data[0];
      const paymentId = session.metadata?.paymentId;

      if (paymentId) {
        // Update payment status to failed
        await this.paymentRepository.update(
          { id: paymentId },
          {
            status: 'failed',
            updatedAt: new Date(),
          },
        );

        // Emit payment failed event
        const payment = await this.paymentRepository.findOne({
          where: { id: paymentId },
        });

        if (payment) {
          this.natsClient.emit('payment_failed', payment);
        }
      }
    }
  }

  async getPaymentBySessionId(sessionId: string) {
    return this.paymentRepository.findOne({
      where: { stripeSessionId: sessionId },
    });
  }

  async getPaymentById(paymentId: string) {
    return this.paymentRepository.findOne({
      where: { id: paymentId },
    });
  }
}
