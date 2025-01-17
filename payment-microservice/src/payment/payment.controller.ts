import { Controller, Inject } from '@nestjs/common';
import { ClientProxy, MessagePattern, Payload } from '@nestjs/microservices';
import { PaymentDto } from './dtos/payment.dto';
import { PaymentService } from './payment.service';

@Controller()
export class PaymentMicroserviceController {
  constructor(
    @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy,
    private readonly paymentService: PaymentService,
  ) {}
  @MessagePattern('create_payment')
  async createPayment(@Payload() payment: PaymentDto) {
    const newPayment = await this.paymentService.createPayment(payment);
    if (newPayment) {
      this.natsClient.emit('payment_created', newPayment);
      console.log(payment);
      return 'payment created successfully';
    }
    return 'payment cannot be created';
  }
}
