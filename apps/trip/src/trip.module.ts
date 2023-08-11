import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { DatabaseModule } from '@app/common';
// import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '@app/common/auth/auth.module';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { AllExceptionsFilter } from '@app/common/core/infra/http/exceptions/exception.filter';
import { JwtAuthGuard } from '@app/common/auth/jwt-auth.guard';
import { TripController } from './trip.controller';
import { TripService } from './trip.service';

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
        FIREBASE_SA: Joi.string().required(),
        GOOGLE_MAPS_API_KEY: Joi.string().required(),
      }),
      ignoreEnvFile: true,
    }),
    DatabaseModule,
    AuthModule,
  ],
  controllers: [TripController],
  providers: [
    TripService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class TripModule {}
