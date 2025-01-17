import { Body, Controller, Inject, Post } from '@nestjs/common';
import { PaymentDto } from './dtos/payment.dto';
import { ClientProxy } from '@nestjs/microservices';

@Controller('payment')
export class PaymentController {
  constructor(
    @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy,
  ) {}
  @Post()
  createPayment(@Body() payment: PaymentDto) {
    this.natsClient.emit('payment_created', payment);
    return this.natsClient.send('create_payment', payment);
  }
}
