/* eslint-disable @typescript-eslint/no-unused-vars */
import * as AppErrors from '@app/common/core/app.error';
import { UniqueEntityID } from '@app/common/core/domain/unique_entity_id';
import { Either, Result, left, right } from '@app/common/core/result';
import { UseCase } from '@app/common/core/usecase';
import { Injectable, Logger } from '@nestjs/common';
import { GoogleMapsService } from 'apps/destination/gmaps/gmaps.service';
import { MultipleDestinationResponseDTO } from '../../dtos/destination.response.dto';
import { SearchDestinationsRequestDTO } from '../../dtos/destinaiton.request.dto';

/* eslint-disable prettier/prettier */
type Response = Either<
  AppErrors.InvalidPayloadError,
  Result<MultipleDestinationResponseDTO>
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

      // Gọi service của google, trả về query Result. Tạm thời chưa có type nào
      const queryResult = await this.googleMapsService.getMultiplePlacesFromText({
            input: query,
            radius: radius && radius,
            language: language,
            // type: string,
            lat: lat,
            lon: lon,
      });

      const response: MultipleDestinationResponseDTO = {
        destinations: [],
        nextPageToken: undefined,
      };
      if (queryResult.nextPageToken) {
        response.nextPageToken = queryResult.nextPageToken;
      }

      queryResult.results.forEach((result) => {
        response.destinations.push({
            place_id: result.place_id,
            name: result.name,
            description: "This is sample description",
            location: {
                lat: result.geometry.location.lat,
                lng: result.geometry.location.lng,
            },
            mapsSearchDetails: result,
            reviews: [],
            isRegistered: false,
            isCached: false,
        });
      });

      /* TO DO:
      Kiểm tra xem destination nào có trong database, nếu có thì query review, set isRegistered = true và gán review của destination đó vào */

      return right(Result.ok<MultipleDestinationResponseDTO>(response));
    } catch (err) {
      return left(new AppErrors.UnexpectedError(err.toString()));
    }
  };
}
