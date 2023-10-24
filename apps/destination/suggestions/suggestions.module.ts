import { Module } from '@nestjs/common';
import { SuggestionsController } from './suggestions.controller';
import { GetSuggestionsBasedOnProvinceUseCase } from './usecase/get_suggestions_based_on_province/get_suggestions_based_on_province.usecase';
import { GoogleMapsService } from '../gmaps/gmaps.service';
import { AdministrativeService } from '../administrative/administrative.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ProvinceRepository,
  ProvinceSchema,
} from '../administrative/province.repo';
import { ProvinceDAO } from '../administrative/schemas/province.schema';
import { AdministrativeModule } from '../administrative/administrative.module';
import { GetSuggestionsBasedOnCurrentLocationUseCase } from './usecase/get_suggestions_based_on_current_location /get_suggestions_based_on_current_location .usecase';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ProvinceDAO.name, schema: ProvinceSchema },
    ]),
    AdministrativeModule,
    SuggestionsModule,
  ],
  controllers: [SuggestionsController],
  providers: [
    GoogleMapsService,
    AdministrativeService,
    ProvinceRepository,
    SuggestionsController,
    GetSuggestionsBasedOnProvinceUseCase,
    GetSuggestionsBasedOnCurrentLocationUseCase,
  ],
  exports: [
    SuggestionsController,
    GetSuggestionsBasedOnProvinceUseCase,
    GetSuggestionsBasedOnCurrentLocationUseCase,
  ],
})
export class SuggestionsModule {}
