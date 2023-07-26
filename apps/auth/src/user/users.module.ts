import { Module, forwardRef } from '@nestjs/common';
import { UsersRepository } from './users.repo';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserDAO } from './schemas/user.schema';
import { AuthModule } from '../auth.module';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../auth.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: UserDAO.name, schema: UserDAO }]),
    forwardRef(() => AuthModule),
  ],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository, AuthService, JwtService],
  exports: [UsersService],
})
export class UsersModule {}
