import { Controller } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { CreateUserDto } from './dtos/create-user.dto';
import { UserService } from './user.service';

@Controller()
export class UserMicroserviceController {
  constructor(private readonly userService: UserService) {}
  @MessagePattern({ cmd: 'createUser' })
  async createUser(@Payload() data: CreateUserDto) {
    await this.userService.createUser(data);
    return { message: 'user created successfully' };
  }
  @EventPattern('payment_created')
  async handlePaymentCreated(@Payload() data: any) {
    console.log('Payment Created:', data);
  }
}
