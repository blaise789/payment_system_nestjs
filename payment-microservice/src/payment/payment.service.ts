import { Inject, Injectable } from '@nestjs/common';
import { PaymentDto } from './dtos/payment.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy,
  ) {}
  async createPayment(payment: PaymentDto) {
    const user = await lastValueFrom(
      this.natsClient.send('getUserById', payment.userId),
    );
    console.log(user);
    if (!user) {
      return null;
    }
    return this.paymentRepository.save(payment);
  }
}
