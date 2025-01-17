import { Module } from '@nestjs/common';
import { NatsClientModule } from 'src/nats-client/nats-client.module';
import { PaymentController } from './payment.controller';

@Module({
  imports: [NatsClientModule],
  controllers: [PaymentController],
})
export class PaymentModule {}
