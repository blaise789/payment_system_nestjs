import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller()
export class UserMicroserviceController {
  @MessagePattern({ cmd: 'createUser' })
  async createUser(@Payload() data: any) {
    console.log(data);
    return { msg: 'success' };
  }
}
