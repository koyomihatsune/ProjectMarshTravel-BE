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
import { User, UserSchema } from './users/schemas/user.schema';
import { UsersModule } from './users/users.module';
import { LoginUseCase } from './usecase/login/login.usecase';
import { APP_FILTER } from '@nestjs/core';
import { AllExceptionsFilter } from '@app/common/core/infra/http/exceptions/exception.filter';
import { PassportModule } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';
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
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    UsersModule,
    // RmqModule.register({
    //   name: DESTINATION_SERVICE,
    // }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtService,
    LoginUseCase,
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
  exports: [AuthService],
})
export class AuthModule {}
