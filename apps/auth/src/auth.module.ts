import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import {
  DatabaseModule,
  RmqModule,
  // RmqModule
} from '@app/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserDAO, UserSchema } from '../user/schemas/user.schema';
import { UsersModule } from '../user/users.module';
import { LoginUseCase } from './usecase/login/login.usecase';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { AllExceptionsFilter } from '@app/common/core/infra/http/exceptions/exception.filter';
import { PassportModule } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';
import { DESTINATION_SERVICE } from './constants/services';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UsersController } from '../user/users.controller';
import { JwtAuthGuard } from '@app/common/auth/jwt-auth.guard';
import { AUTH_SERVICE } from '@app/common/auth/services';
// import { DESTINATION_SERVICE } from './constants/services';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        PORT: Joi.number().required(),
        MONGODB_URI: Joi.string().required(),
        RABBIT_MQ_URI: Joi.string().required(),
        RABBIT_MQ_AUTH_QUEUE: Joi.string().required(),
        RABBIT_MQ_DESTINATION_QUEUE: Joi.string().required(),
        JWT_SECRET_KEY: Joi.string().required(),
        JWT_REFRESH_KEY: Joi.string().required(),
        FIREBASE_SA: Joi.string().required(),
      }),
      ignoreEnvFile: true,
      // Nếu không tìm được một environment variable nào đó sẽ báo lỗi
    }),
    DatabaseModule,
    RmqModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    MongooseModule.forFeature([{ name: UserDAO.name, schema: UserSchema }]),
    UsersModule,
    RmqModule.register({
      name: DESTINATION_SERVICE,
    }),
    RmqModule.register({
      name: AUTH_SERVICE,
    }),
  ],
  // Map cả 2 controller vào AuthModule vì AuthModule là module chính
  controllers: [AuthController, UsersController],
  providers: [
    AuthService,
    JwtService,
    JwtStrategy,
    LoginUseCase,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
  exports: [AuthService],
})
export class AuthModule {}
