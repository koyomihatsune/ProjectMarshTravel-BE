import * as AppErrors from '@app/common/core/app.error';
import { Either, Result, left, right } from '@app/common/core/result';
import { UseCase } from '@app/common/core/usecase';
import { Injectable, Logger } from '@nestjs/common';
import { GoogleMapsService } from 'apps/destination/gmaps/gmaps.service';
import * as DestinationErrors from '../../../src/usecase/errors/destination.errors';
import {
  CategoryDestinationsList,
  SuggestionsResponseDTO,
} from '../../dto/suggestions.dto';
import { GetSuggestionsBasedOnCurrentLocationDTO } from './get_suggestions_based_on_current_location .dto.ts';
import { AdministrativeService } from 'apps/destination/administrative/administrative.service';
import {
  CUSTOM_EXPLORE_TAGS,
  GENERAL_EXPLORE_TAGS,
} from '../../constants/explore_tags';
import { SingleDestinationResponseDTO } from '../../../src/dtos/destination.response.dto';
import { DestinationMapper } from 'apps/destination/src/mapper/destination.mapper';

/* eslint-disable prettier/prettier */
type Response = Either<
  AppErrors.InvalidPayloadError | DestinationErrors.DestinationNotFound,
  Result<SuggestionsResponseDTO>
>;

@Injectable()
export class GetSuggestionsBasedOnCurrentLocationUseCase
  implements UseCase<GetSuggestionsBasedOnCurrentLocationDTO, Promise<Response>>
{
  constructor(
    private readonly googleMapsService: GoogleMapsService,
    private readonly administrativeService: AdministrativeService,
  ) {}

  execute = async (dto: GetSuggestionsBasedOnCurrentLocationDTO): Promise<Response> => {
    try {
      const { lat, lon, language } = dto;

      const name = await this.googleMapsService.getProvinceNameFromLatLon(lat, lon, language);


      const foundProvince = await this.administrativeService.getProvinceDetailsByName(name, language);
      if (foundProvince === undefined) {
        return left(new AppErrors.InvalidPayloadError('You are not inside Vietnam or the location is not valid'));
      }

      const bestPlacesQueryResult = await this.googleMapsService.getMultiplePlacesFromText({
        input: `best attractions to visit nearby`,
        lat: lat,
        lon: lon,
        language: language === 'vi' ? 'vi' : 'en',
      }).then((res) => res.results.slice(0,10).map((result) => {
        return DestinationMapper.searchQueryResultToResponseDTO(result);
      }));


      const placesQueryByCategoryResult: CategoryDestinationsList[]= [];

      await Promise.all(
        GENERAL_EXPLORE_TAGS.map(async (tag) => {
          const queryResult = await this.googleMapsService.getMultiplePlacesFromText({
              input: `${tag.query} nearby`,
              lat: lat,
              lon: lon,
              language: language === 'vi' ? 'vi' : 'en',
            })

            const destinationList: SingleDestinationResponseDTO[] = queryResult.results.slice(0,10).map((result) => {
              return DestinationMapper.searchQueryResultToResponseDTO(result);
            });

            placesQueryByCategoryResult.push({
              name: language === 'vi' ? tag.name : tag.name_en,
              id: tag.id,
              list: destinationList,
            });
        })
      );

      if (foundProvince.explore_tags?.length > 0) {
        await Promise.all(
          foundProvince.explore_tags.map(async (tag) => {
            const foundTag = CUSTOM_EXPLORE_TAGS.find((item) => item.id === tag);
            if (foundTag === undefined) return;

            const queryResult = await this.googleMapsService.getMultiplePlacesFromText({
              input: `${foundTag.query} nearby`,
              lat: lat,
              lon: lon,
              language: language === 'vi' ? 'vi' : 'en',
            })

            const destinationList: SingleDestinationResponseDTO[] = queryResult.results.slice(0,10).map((result) => {
              return DestinationMapper.searchQueryResultToResponseDTO(result);
            });

            placesQueryByCategoryResult.push({
              name: language === 'vi' ? foundTag.name : foundTag.name_en,
              id: foundTag.id,
              list: destinationList,
            });
          })
        );  
      }
      
      
      return right(Result.ok<SuggestionsResponseDTO>({
        name: foundProvince.name,
        listRating: bestPlacesQueryResult,
        categories: placesQueryByCategoryResult,
      }));
    } catch (err) {
      Logger.error(err, err.stack, 'GetSuggestionsBasedOnCurrentLocationUseCase');
      return left(new AppErrors.UnexpectedError(err.toString()));
    }
  };
}
