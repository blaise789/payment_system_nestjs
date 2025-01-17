import { Controller, Inject } from '@nestjs/common';
import { ClientProxy, MessagePattern, Payload } from '@nestjs/microservices';
import { PaymentDto } from './dtos/payment.dto';

@Controller()
export class PaymentMicroserviceController {
  constructor(
    @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy,
  ) {}
  @MessagePattern('create_payment')
  async createPayment(@Payload() payment: PaymentDto) {
    // this.natsClient.emit('payment_created', payment);
    console.log(payment);
    return 'payment created successfully';
  }
}
