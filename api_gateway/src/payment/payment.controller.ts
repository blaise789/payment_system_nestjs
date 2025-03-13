import {
  Headers,
  Body,
  Controller,
  Inject,
  Post,
  RawBodyRequest,
  Req,
} from '@nestjs/common';
import { PaymentDto } from './dtos/payment.dto';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Controller('payment')
export class PaymentController {
  private readonly stripe: Stripe;

  constructor(
    private readonly configService: ConfigService,
    @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy,
  ) {
    this.stripe = new Stripe(configService.get('STRIPE_SECRET_KEY'));
  }
  @Post()
  createCheckoutSession(@Body() payment: PaymentDto) {
    // this.natsClient.emit('payment_created', payment);
    return this.natsClient.send('create_payment', payment);
  }

  @Post('/webhook')
  async handleWebhook(
    @Req() request: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    const webhookSecret = this.configService.get<string>(
      'STRIPE_WEBHOOK_SECRET',
    );

    if (!webhookSecret) {
      console.error('Stripe webhook secret is missing.');
      return { success: false, message: 'Webhook secret not configured' };
    }

    let event: Stripe.Event;
    try {
      event = this.stripe.webhooks.constructEvent(
        request.rawBody,
        signature,
        webhookSecret,
      );
    } catch (error: any) {
      console.error('Webhook verification failed:', error.message);
      return { success: false, message: 'Invalid webhook signature' };
    }

    await lastValueFrom(this.natsClient.send('process_payment_webhook', event));

    return { success: true, message: 'Webhook processed successfully' };
  }
}
