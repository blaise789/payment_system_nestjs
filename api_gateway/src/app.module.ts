import { Module } from '@nestjs/common';
import { UserModule } from './users/user.module';
import { PaymentModule } from './payment/payment.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    UserModule,
    PaymentModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
