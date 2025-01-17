import { Module } from '@nestjs/common';
import { UserMicroserviceController } from './user.controller';

@Module({
  controllers: [UserMicroserviceController],
})
export class UserModule {
  // define the UserController and UserService in this module
}
