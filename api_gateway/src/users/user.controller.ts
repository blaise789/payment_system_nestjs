import { Body, Controller, Inject, Post } from '@nestjs/common';
import { CreateUserDto } from './dtos/user.dto';
import { ClientProxy } from '@nestjs/microservices';

@Controller('users')
export class UsersController {
  constructor(
    @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy,
  ) {}

  @Post()
  createUser(@Body() user: CreateUserDto) {
    return this.natsClient.send({ cmd: 'createUser' }, user);
  }
}
