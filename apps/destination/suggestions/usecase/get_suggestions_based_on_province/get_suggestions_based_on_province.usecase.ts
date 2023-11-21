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
import { GetSuggestionsBasedOnProvinceDTO } from './get_suggestions_based_on_province.dto.ts';
import { AdministrativeService } from 'apps/destination/administrative/administrative.service';
import {
  CUSTOM_EXPLORE_TAGS,
  GENERAL_EXPLORE_TAGS,
} from '../../constants/explore_tags';
import { SingleDestinationResponseDTO } from '../../../src/dtos/destination.response.dto';
import { DestinationMapper } from 'apps/destination/src/mapper/destination.mapper';
import { FollowedAdministrativeService } from 'apps/destination/followed_administrative/followed_administrative.service';
import { UniqueEntityID } from '@app/common/core/domain/unique_entity_id';
import { UserId } from 'apps/auth/user/domain/user_id';

/* eslint-disable prettier/prettier */
type Response = Either<
  AppErrors.InvalidPayloadError | DestinationErrors.DestinationNotFound,
  Result<SuggestionsResponseDTO>
>;

type GetSuggestionsBasedOnProvinceDTOWithUserId = {
  request: GetSuggestionsBasedOnProvinceDTO,
  userId: string,
}
@Injectable()
export class GetSuggestionsBasedOnProvinceUseCase
  implements UseCase<GetSuggestionsBasedOnProvinceDTOWithUserId, Promise<Response>>
{
  constructor(
    private readonly googleMapsService: GoogleMapsService,
    private readonly administrativeService: AdministrativeService,
    private readonly followedAdministrativeService: FollowedAdministrativeService,
  ) {}

  execute = async (dto: GetSuggestionsBasedOnProvinceDTOWithUserId): Promise<Response> => {
    try {
      const { code, language } = dto.request;


      const foundProvince = await this.administrativeService.getProvinceDetailsByCode(code);
    
      if (foundProvince === undefined) {
        return left(new AppErrors.InvalidPayloadError('Province code is invalid'));
      }
      
      const userIdOrError = UserId.create(new UniqueEntityID(dto.userId));

      const provinceFollowRecord = await this.followedAdministrativeService.getFollowedAdministrative(userIdOrError, code, 'province');

      const bestPlacesQueryResult = await this.googleMapsService.getMultiplePlacesFromText({
        input: `best attractions to visit near ${foundProvince.name}`,
        language: language === 'vi' ? 'vi' : 'en',
      }).then((res) => res.results.slice(0,10).map((result) => {
        return DestinationMapper.searchQueryResultToResponseDTO(result);
      }));


      const placesQueryByCategoryResult: CategoryDestinationsList[]= [];

      await Promise.all(
        GENERAL_EXPLORE_TAGS.map(async (tag) => {
          const queryResult = await this.googleMapsService.getMultiplePlacesFromText({
              input: `${tag.query} near center of ${foundProvince.name}`,
              language: 'vi',
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
              input: `${foundTag.query} near ${foundProvince.name}`,
              language: 'vi',
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
        code: foundProvince.code,
        followed: provinceFollowRecord !== undefined,
        listRating: bestPlacesQueryResult,
        categories: placesQueryByCategoryResult,
      }));
    } catch (err) {
      Logger.error(err, err.stack, 'GetSuggestionsBasedOnProvinceUseCase');
      return left(new AppErrors.UnexpectedError(err.toString()));
    }
  };
}
