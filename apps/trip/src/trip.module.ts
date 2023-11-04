import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { DatabaseModule, RmqModule } from '@app/common';
// import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '@app/common/auth/auth.module';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { AllExceptionsFilter } from '@app/common/core/infra/http/exceptions/exception.filter';
import { JwtAuthGuard } from '@app/common/auth/jwt-auth.guard';
import { TripController } from './trip.controller';
import { TripService } from './trip.service';
import { TripRepository } from './trip.repo';
import { MongooseModule } from '@nestjs/mongoose';
import { TripDAO, TripSchema } from './schemas/trip.schema';
// import { TripDayDAO, TripDaySchema } from '../trip_day/schema/trip_day.schema';
// import {
//   TripDestinationDAO,
//   TripDestinationSchema,
// } from '../trip_destination/schema/trip_destination.schema';
import { CreateTripUseCase } from './usecase/trip/create_trip/create_trip.usecase';
import { UpdateTripUseCase } from './usecase/trip/update_trip/update_trip.usecase';
import { CreateTripDayUseCase } from './usecase/trip_day/create_trip_day/create_trip_day.usecase';
import { UpdateTripDayUseCase } from './usecase/trip_day/update_trip_day/update_trip_day.usecase';
import { UpdateTripDayPositionUseCase } from './usecase/trip_day/update_trip_day_position/update_trip_day_position.usecase';
import { CreateTripDestinationUseCase } from './usecase/trip_destination/create_trip_destination/create_trip_destination.usecase';
import { UpdateTripDestinationPositionUseCase } from './usecase/trip_destination/update_trip_destination_position/update_trip_destination_position.usecase';
import { AUTH_SERVICE, DESTINATION_SERVICE } from '@app/common/global/services';
import { GetTripListPaginationUseCase } from './usecase/trip/get_trip_list/get_trip_list.usecase';
import { GetTripDetailsUseCase } from './usecase/trip/get_trip_details/get_trip_details.usecase';
import { GetTripDayDetailsUseCase } from './usecase/trip_day/g\u001Det_trip_day_details/get_trip_day_details.usecase';
import { DeleteTripDayUseCase } from './usecase/trip_day/delete_trip_day/delete_trip_day.usecase';
import { DeleteTripDestinationUseCase } from './usecase/trip_destination/delete_trip_destination/delete_trip_destination.usecase';
import { GetOptimizedTripDayRecommendationUseCase } from './usecase/trip_day/get_optimized_trip_day_recommendation/get_optimized_trip_day_recommendation.usecase';
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
    MongooseModule.forFeature([
      { name: TripDAO.name, schema: TripSchema },
      // { name: TripDayDAO.name, schema: TripDaySchema },
      // { name: TripDestinationDAO.name, schema: TripDestinationSchema },
      // Other feature modules...
    ]),
    RmqModule,
    RmqModule.register({
      name: AUTH_SERVICE,
    }),
    RmqModule.register({
      name: DESTINATION_SERVICE,
    }),
  ],
  controllers: [TripController],
  providers: [
    TripService,
    TripRepository,
    GetTripListPaginationUseCase,
    GetTripDetailsUseCase,
    GetTripDayDetailsUseCase,
    GetOptimizedTripDayRecommendationUseCase,
    CreateTripUseCase,
    UpdateTripUseCase,
    CreateTripDayUseCase,
    UpdateTripDayUseCase,
    DeleteTripDayUseCase,
    UpdateTripDayPositionUseCase,
    CreateTripDestinationUseCase,
    DeleteTripDestinationUseCase,
    UpdateTripDestinationPositionUseCase,
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
