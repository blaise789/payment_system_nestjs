import { Module } from '@nestjs/common';
import { NatsClientModule } from 'src/nats-client/nats-client.module';
import { PaymentMicroserviceController } from './payment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';
import { PaymentService } from './payment.service';
import { User } from './entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Payment, User]), NatsClientModule],
  controllers: [PaymentMicroserviceController],
  providers: [PaymentService],
})
export class PaymentModule {}
