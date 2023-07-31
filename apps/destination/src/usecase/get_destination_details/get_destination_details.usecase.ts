import * as AppErrors from '@app/common/core/app.error';
import { Either, Result, left, right } from '@app/common/core/result';
import { UseCase } from '@app/common/core/usecase';
import { Injectable } from '@nestjs/common';
import { GoogleMapsService } from 'apps/destination/gmaps/gmaps.service';
import {
  DestinationSingleResponseDTO,
  GetDestinationDetailsRequestDTO,
} from './get_destination_details.dto';

/* eslint-disable prettier/prettier */
type Response = Either<
  AppErrors.InvalidPayloadError,
  Result<DestinationSingleResponseDTO>
>;

@Injectable()
export class GetDestinationDetailsUseCase
  implements UseCase<GetDestinationDetailsRequestDTO, Promise<Response>>
{
  constructor(
    private readonly googleMapsService: GoogleMapsService,
  ) {}

  execute = async (dto: GetDestinationDetailsRequestDTO): Promise<Response> => {
    try {
      const { place_id, language } = dto;

      // Gọi service của google, trả về query Result. Tạm thời chưa có type nào
      const queryResult = await this.googleMapsService.getPlaceByID({placeId: place_id, language : language});
      const response: DestinationSingleResponseDTO = {
          destinationId: queryResult.place_id,
          name: queryResult.name,
          location: {
              lat: queryResult.geometry.location.lat,
              lng: queryResult.geometry.location.lng,
          },
          mapsFullDetails: queryResult,
          reviews: [],
          isRegistered: false,
        };

      /* TO DO:
      Kiểm tra xem destination nào có trong database, nếu có thì query review, set isRegistered = true và gán review của destination đó vào */

      return right(Result.ok<DestinationSingleResponseDTO>(response));
    } catch (err) {
      return left(new AppErrors.UnexpectedError(err.toString()));
    }
  };
}
