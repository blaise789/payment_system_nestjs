import { Controller, Inject } from '@nestjs/common';
import { ClientProxy, MessagePattern, Payload } from '@nestjs/microservices';
import { PaymentDto } from './dtos/payment.dto';
import { PaymentService } from './payment.service';
import Stripe from 'stripe';

@Controller()
export class PaymentMicroserviceController {
  constructor(
    @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy,
    private readonly paymentService: PaymentService,
  ) {}

  @MessagePattern('create_payment')
  async createPayment(@Payload() payment: PaymentDto) {
    try {
      const session = await this.paymentService.createPayment(payment);
      return session;
    } catch (err: any) {
      console.log(err.message);
      return { error: err.message };
    }
  }

  @MessagePattern('process_payment_webhook')
  async processWebhook(@Payload() event: Stripe.Event) {
    try {
      await this.paymentService.handleWebhook(event);
      return { success: true };
    } catch (err) {
      console.error('Failed to process webhook event:', err.message);
      return { success: false, message: err.message };
    }
  }
}
