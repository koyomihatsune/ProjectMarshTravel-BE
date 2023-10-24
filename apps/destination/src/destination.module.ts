import { Module } from '@nestjs/common';
import { DestinationController } from './destination.controller';
import { DestinationService } from './destination.service';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { DatabaseModule, RmqModule } from '@app/common';
// import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '@app/common/auth/auth.module';
import { GoogleMapsModule } from '../gmaps/gmaps.module';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { AllExceptionsFilter } from '@app/common/core/infra/http/exceptions/exception.filter';
import { JwtAuthGuard } from '@app/common/auth/jwt-auth.guard';
import { SearchDestinationsUseCase } from './usecase/search_destinations/search_destinations.usecase';
import { GetDestinationDetailsUseCase } from './usecase/get_destination_details/get_destination_details.usecase';
import { GetMultipleDestinationDetailsUseCase } from './usecase/get_multiple_destination_details/get_multiple_destination_details.usecase';
import { AdministrativeService } from '../administrative/administrative.service';
import { AdministrativeModule } from '../administrative/administrative.module';
import { AdministrativeController } from '../administrative/administrative.controller';
import { SuggestionsController } from '../suggestions/suggestions.controller';
import { SuggestionsModule } from '../suggestions/suggestions.module';

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
        // FIREBASE_SA: Joi.string().required(),
        GOOGLE_MAPS_API_KEY: Joi.string().required(),
      }),
      ignoreEnvFile: true,
    }),
    DatabaseModule,
    AuthModule,
    RmqModule,
    GoogleMapsModule,
    AdministrativeModule,
    SuggestionsModule,
  ],
  controllers: [
    DestinationController,
    AdministrativeController,
    SuggestionsController,
  ],
  providers: [
    DestinationService,
    AdministrativeService,
    SearchDestinationsUseCase,
    GetDestinationDetailsUseCase,
    GetMultipleDestinationDetailsUseCase,
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
export class DestinationModule {}
