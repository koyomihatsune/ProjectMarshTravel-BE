/* eslint-disable @typescript-eslint/no-unused-vars */
import * as AppErrors from '@app/common/core/app.error';
import { UniqueEntityID } from '@app/common/core/domain/unique_entity_id';
import { Either, Result, left, right } from '@app/common/core/result';
import { UseCase } from '@app/common/core/usecase';
import { Injectable, Logger } from '@nestjs/common';
import { GoogleMapsService } from 'apps/destination/gmaps/gmaps.service';
import {
  DestinationMultipleResponseDTO,
  SearchDestinationsRequestDTO,
} from '../dtos/destination.dto';

/* eslint-disable prettier/prettier */
type Response = Either<
  AppErrors.InvalidPayloadError,
  Result<DestinationMultipleResponseDTO>
>;

@Injectable()
export class SearchDestinationsAutocompleteUseCase
  implements UseCase<SearchDestinationsRequestDTO, Promise<Response>>
{
  constructor(
    private readonly googleMapsService: GoogleMapsService,
  ) {}

  execute = async (dto: SearchDestinationsRequestDTO): Promise<Response> => {
    try {
      const { query, radius, language, lat, lon } = dto;

        Logger.error("This is DTO");
      Logger.error(dto);
      // Gọi service của google, trả về query Result. Tạm thời chưa có type nào
      const queryResult = await this.googleMapsService.getMultiplePlacesFromText({
            input: query,
            radius: radius && radius,
            language: language,
            // type: string,
            lat: lat,
            lon: lon,
      });
      Logger.error(queryResult);

      const response: DestinationMultipleResponseDTO = {
        destinations: [],
        nextPageToken: undefined,
      };
      if (queryResult.nextPageToken) {
        response.nextPageToken = queryResult.nextPageToken;
      }

      queryResult.results.forEach((result) => {
        response.destinations.push({
            destinationId: result.place_id,
            name: result.name,
            location: {
                lat: result.geometry.location.lat,
                lng: result.geometry.location.lng,
            },
            mapsSearchDetails: result,
            reviews: [],
            isRegistered: false,
        });
      });

      /* TO DO:
      Kiểm tra xem destination nào có trong database, nếu có thì query review, set isRegistered = true và gán review của destination đó vào */

      return right(Result.ok<DestinationMultipleResponseDTO>(response));
    } catch (err) {
      return left(new AppErrors.UnexpectedError(err.toString()));
    }
  };
}
