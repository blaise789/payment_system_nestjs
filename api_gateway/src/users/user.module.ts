import { Module } from '@nestjs/common';
import { UsersController } from './user.controller';
import { NatsClientModule } from 'src/nats-client/nats-client.module';

@Module({
  imports: [NatsClientModule],
  controllers: [UsersController],
})
export class UserModule {}
