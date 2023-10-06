import * as AppErrors from '@app/common/core/app.error';
import { Either, Result, left, right } from '@app/common/core/result';
import { UseCase } from '@app/common/core/usecase';
import { Injectable, Logger } from '@nestjs/common';
import { GoogleMapsService } from 'apps/destination/gmaps/gmaps.service';
import {
  MultipleDestinationResponseDTO,
  SingleDestinationResponseDTO,
} from '../../dtos/destination.response.dto';
import { GetMultipleDestinationDetailsRequestDTO } from '../../dtos/destinaiton.request.dto';

/* eslint-disable prettier/prettier */
type Response = Either<
  AppErrors.InvalidPayloadError,
  Result<MultipleDestinationResponseDTO>
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

      const queryResult = [];

      // hình như foreach không dùng được với async, cần điều tra lại
      await Promise.all(place_ids.map( async (place_id) => {
        // Gọi service của google, trả về query Result. Tạm thời chưa có type nào
        const subqueryResult = await this.googleMapsService.getPlaceByID({placeId: place_id, language : language});
        if (subqueryResult === undefined) {
          Logger.error(`Place ${place_id} not found`, 'GetMultipleDestinationDetailsUseCase');
        } else {
          const singleResponse: SingleDestinationResponseDTO = {
            place_id: subqueryResult.place_id,
            name: subqueryResult.name,
            location: {
                lat: subqueryResult.geometry.location.lat,
                lng: subqueryResult.geometry.location.lng,
            },
            mapsFullDetails: subqueryResult,
            reviews: [],
            isRegistered: false,
          };
          queryResult.push(singleResponse);
        }
        // đã handle trường hợp lỗi, nếu lỗi sẽ thay thế bằng error response và cả bên trip cũng vậy
      }));

      const result: MultipleDestinationResponseDTO = {
        destinations: queryResult,
      };

      /* TO DO:
      Kiểm tra xem destination nào có trong database, nếu có thì query review, set isRegistered = true và gán review của destination đó vào */

      return right(Result.ok<MultipleDestinationResponseDTO>(result));
    } catch (err) {
      Logger.error(err, err.stack);
      return left(new AppErrors.UnexpectedError(err.toString()));
    }
  };
}
