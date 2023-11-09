import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import {
  DatabaseModule,
  RmqModule,
  // RmqModule
} from '@app/common';
import { UsersModule } from '../user/users.module';
import { LoginUseCase } from './usecase/login/login.usecase';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { AllExceptionsFilter } from '@app/common/core/infra/http/exceptions/exception.filter';
import { PassportModule } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UsersController } from '../user/users.controller';
import { JwtAuthGuard } from '@app/common/auth/jwt-auth.guard';
import { AUTH_SERVICE } from '@app/common/global/services';
import { MongooseModule } from '@nestjs/mongoose';
import { AddPhoneNumberToRegistrationQueueUseCase } from './usecase/add_phone_number_to_registration_queue/add_phone_number_to_registration_queue.usecase';
import {
  RegistrationQueueDAO,
  RegistrationQueueSchema,
} from './schemas/registration_queue.schema';
import { RegistrationQueueRepository } from './registration_queue.repo';
import { TwilioService } from '../twilio/twilio.service';
import { TwilioModule } from '../twilio/twilio.module';
import { LoginPhoneNumberUseCase } from './usecase/login_with_phone_number/login_with_phone_number.usecase';

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
        GCLOUD_SA: Joi.string().required(),
        GCLOUD_STORAGE_BUCKET_NAME: Joi.string().required(),
        TWILIO_ACCOUNTSID: Joi.string().required(),
        TWILIO_AUTHTOKEN: Joi.string().required(),
        TWILIO_VERIFYSID: Joi.string().required(),
      }),
      ignoreEnvFile: true,
      // Nếu không tìm được một environment variable nào đó sẽ báo lỗi
    }),
    DatabaseModule,
    RmqModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    forwardRef(() => UsersModule),
    RmqModule.register({
      name: AUTH_SERVICE,
    }),
    MongooseModule.forFeature([
      { name: RegistrationQueueDAO.name, schema: RegistrationQueueSchema },
    ]),
    TwilioModule,
  ],
  // Map cả 2 controller vào AuthModule vì AuthModule là module chính
  controllers: [AuthController, UsersController],
  providers: [
    AuthService,
    JwtService,
    JwtStrategy,
    TwilioService,
    RegistrationQueueRepository,
    LoginUseCase,
    LoginPhoneNumberUseCase,
    AddPhoneNumberToRegistrationQueueUseCase,
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
