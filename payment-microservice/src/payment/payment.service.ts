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
    console.log(user);
    if (!user) {
      return null;
    }
    try {
      // creating a checkout session
      const session = await this.stripe.checkout.sessions.create({
        line_items: [
          {
            price_data: {
              currency: payment.currency,
              product_data: {
                name: `Test Product`, // You can customize the product name as needed
                // Additional product information can be added here
              },
              unit_amount: payment.amount * 100, // Amount is in cents
            },
            quantity: payment.quantity, // Specify the quantity of the product
          },
        ],
        mode: 'payment', // Set the mode to 'payment'
        success_url: `${this.configService.get<string>('CLIENT_URL')}/success.html`, // Redirect URL on success
        cancel_url: `${this.configService.get<string>('CLIENT_URL')}/cancel.html`, // Redirect URL on cancellation
        metadata: {
          userId: payment.userId,
        },
      });

      return this.paymentRepository.create({
        ...payment,
        sessionId: session.id,
        status: 'pending',
      });
    } catch (err: any) {
      throw new BadRequestException(`Payment failed: ${err.message}`);
    }
  }
}
