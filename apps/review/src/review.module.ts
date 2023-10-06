import { DatabaseModule, RmqModule } from '@app/common';
import { JwtAuthGuard } from '@app/common/auth/jwt-auth.guard';
import { AllExceptionsFilter } from '@app/common/core/infra/http/exceptions/exception.filter';
import { AUTH_SERVICE, DESTINATION_SERVICE } from '@app/common/global/services';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { AuthModule } from '@app/common/auth/auth.module';
import { ReviewController } from './review.controller';
import { StorageModule } from '@app/common/storage/storage.module';
import * as Joi from 'joi';
import { CreateReviewUseCase } from './usecase/create_review/create_review.usecase';
import { ReviewService } from './review.service';
import { ReviewRepository } from './review.repo';
import { MongooseModule } from '@nestjs/mongoose';
import { ReviewDAO, ReviewSchema } from './schemas/review.schema';
import { NestjsFormDataModule } from 'nestjs-form-data';

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
        RABBIT_MQ_TRIP_QUEUE: Joi.string().required(),
        GCLOUD_SA: Joi.string().required(),
        GCLOUD_STORAGE_BUCKET_NAME: Joi.string().required(),
      }),
      ignoreEnvFile: true,
    }),
    DatabaseModule,
    AuthModule,
    RmqModule,
    NestjsFormDataModule,
    MongooseModule.forFeature([
      { name: ReviewDAO.name, schema: ReviewSchema },
      // { name: TripDayDAO.name, schema: TripDaySchema },
      // { name: TripDestinationDAO.name, schema: TripDestinationSchema },
      // Other feature modules...
    ]),
    RmqModule.register({
      name: AUTH_SERVICE,
    }),
    RmqModule.register({
      name: DESTINATION_SERVICE,
    }),
    StorageModule,
  ],
  controllers: [ReviewController],
  providers: [
    CreateReviewUseCase,
    ReviewService,
    ReviewRepository,
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
