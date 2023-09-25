import { DatabaseModule, RmqModule } from '@app/common';
import { JwtAuthGuard } from '@app/common/auth/jwt-auth.guard';
import { AllExceptionsFilter } from '@app/common/core/infra/http/exceptions/exception.filter';
import { AUTH_SERVICE, DESTINATION_SERVICE } from '@app/common/global/services';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { AuthModule } from 'apps/auth/src/auth.module';
import Joi from 'joi';
import { ReviewController } from './review.controller';

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
      }),
      ignoreEnvFile: true,
    }),
    DatabaseModule,
    AuthModule,
    // MongooseModule.forFeature([
    //   { name: TripDAO.name, schema: TripSchema },
    //   { name: TripDayDAO.name, schema: TripDaySchema },
    //   { name: TripDestinationDAO.name, schema: TripDestinationSchema },
    //   // Other feature modules...
    // ]),
    RmqModule,
    RmqModule.register({
      name: AUTH_SERVICE,
    }),
    RmqModule.register({
      name: DESTINATION_SERVICE,
    }),
  ],
  controllers: [ReviewController],
  providers: [
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
export class ReviewModule {}
