import { Module } from '@nestjs/common';
import { UserMicroserviceController } from './user.controller';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UserMicroserviceController],
  providers: [UserService], // define the UserService in this module
})
export class UserModule {
  // define the UserController and UserService in this module
}
