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
      const { place_ids, language, getMatrixOnly} = dto;

      const queryResult = [];

      const distanceMapResult = (Array.isArray(place_ids) && place_ids.length > 1) ? await this.googleMapsService.getDistanceMatrixList({
        origins: place_ids,
        destinations: place_ids,
        language: language,
      }) : undefined;
      
      let result: MultipleDestinationResponseDTO = {
        destinations: undefined,
        distanceMatrixList: distanceMapResult,
      };
      
      if (!getMatrixOnly) {
        const placeIdsStandardized : string[] = Array.isArray(place_ids) ? dto.place_ids : [dto.place_ids as unknown as string]

        // hình như foreach không dùng được với async, cần điều tra lại
        await Promise.all(placeIdsStandardized.map( async (place_id) => {
          // Gọi service của google, trả về query Result. Tạm thời chưa có type nào
          const subqueryResult = await this.googleMapsService.getPlaceByID({placeId: place_id, language : language});
          
          if (subqueryResult === undefined) {
            Logger.error(`Place ${place_id} not found`, 'GetMultipleDestinationDetailsUseCase');
          } else {
            const singleResponse: SingleDestinationResponseDTO = {
              place_id: subqueryResult.place_id,
              name: subqueryResult.name,
              description: "Địa điểm văn hoá nổi bật của thành phố",
              location: {
                  lat: subqueryResult.geometry.location.lat,
                  lng: subqueryResult.geometry.location.lng,
              },
              mapsFullDetails: subqueryResult,
              reviews: [],
              isRegistered: false,
              isCached: false,
            };
            queryResult.push(singleResponse);
          }

          // đã handle trường hợp lỗi, nếu lỗi sẽ thay thế bằng error response và cả bên trip cũng vậy
        }));
        
        result = {
          destinations: queryResult,
          distanceMatrixList: distanceMapResult,
        };
      }
      /* TO DO:
      Kiểm tra xem destination nào có trong database, nếu có thì query review, set isRegistered = true và gán review của destination đó vào */

      return right(Result.ok<MultipleDestinationResponseDTO>(result));
    } catch (err) {
      Logger.error(err, err.stack);
      return left(new AppErrors.UnexpectedError(err.toString()));
    }
  };
}
