import * as AppErrors from '@app/common/core/app.error';
import { Either, Result, left, right } from '@app/common/core/result';
import { UseCase } from '@app/common/core/usecase';
import { Injectable } from '@nestjs/common';
import { GoogleMapsService } from 'apps/destination/gmaps/gmaps.service';
import {
  DestinationMultipleResponseDTO,
  DestinationSingleResponseDTO,
  GetMultipleDestinationDetailsRequestDTO,
} from '../dtos/destination.dto';

/* eslint-disable prettier/prettier */
type Response = Either<
  AppErrors.InvalidPayloadError,
  Result<DestinationMultipleResponseDTO>
>;

@Injectable()
export class GetMultipleDestinationDetailsUseCase
  implements UseCase<GetMultipleDestinationDetailsRequestDTO, Promise<Response>>
{
  constructor(
    private readonly googleMapsService: GoogleMapsService,
  ) {}

  execute = async (dto: GetMultipleDestinationDetailsRequestDTO): Promise<Response> => {
    try {
      const { place_ids, language } = dto;

      const result: DestinationMultipleResponseDTO = {
        destinations: [],
      };

      // hình như foreach không dùng được với async, cần điều tra lại
      const queryResult = place_ids.forEach(async (place_id) => {
        // Gọi service của google, trả về query Result. Tạm thời chưa có type nào
        const subqueryResult = await this.googleMapsService.getPlaceByID({placeId: place_id, language : language});
        // chưa handle trường hợp lỗi, nếu lỗi sẽ thay thế bằng error response và cả bên trip cũng vậy
        const singleResponse: DestinationSingleResponseDTO = {
            destinationId: subqueryResult.place_id,
            name: subqueryResult.name,
            location: {
                lat: subqueryResult.geometry.location.lat,
                lng: subqueryResult.geometry.location.lng,
            },
            mapsFullDetails: queryResult,
            reviews: [],
            isRegistered: false,
          };
        result.destinations.push(singleResponse);
      });

      /* TO DO:
      Kiểm tra xem destination nào có trong database, nếu có thì query review, set isRegistered = true và gán review của destination đó vào */

      return right(Result.ok<DestinationMultipleResponseDTO>(result));
    } catch (err) {
      return left(new AppErrors.UnexpectedError(err.toString()));
    }
  };
}
