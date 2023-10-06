import * as AppErrors from '@app/common/core/app.error';
import { Either, Result, left, right } from '@app/common/core/result';
import { UseCase } from '@app/common/core/usecase';
import { Injectable } from '@nestjs/common';
import { GoogleMapsService } from 'apps/destination/gmaps/gmaps.service';
import { SingleDestinationResponseDTO } from '../../dtos/destination.response.dto';
import { GetDestinationDetailsRequestDTO } from '../../dtos/destinaiton.request.dto';
import { AdministrativeService } from 'apps/destination/administrative/administrative.service';
import * as DestinationErrors from '../errors/destination.errors';

/* eslint-disable prettier/prettier */
type Response = Either<
  AppErrors.InvalidPayloadError | DestinationErrors.DestinationNotFound,
  Result<SingleDestinationResponseDTO>
>;

@Injectable()
export class GetDestinationDetailsUseCase
  implements UseCase<GetDestinationDetailsRequestDTO, Promise<Response>>
{
  constructor(
    private readonly googleMapsService: GoogleMapsService,
    private readonly administrativeService: AdministrativeService,
  ) {}

  execute = async (dto: GetDestinationDetailsRequestDTO): Promise<Response> => {
    try {
      const { place_id, language } = dto;

      // Gọi service của google, trả về query Result. Tạm thời chưa có type nào
      const queryResult = await this.googleMapsService.getPlaceByID({placeId: place_id, language : language});

      if (queryResult === undefined) {
        return left(new DestinationErrors.DestinationNotFound());
      }

  
      let response: SingleDestinationResponseDTO = {
          place_id: queryResult.place_id,
          name: queryResult.name,
          description: "This is sample description",
          location: {
              lat: queryResult.geometry.location.lat,
              lng: queryResult.geometry.location.lng,
          },
          mapsFullDetails: queryResult,
          reviews: [],
          isRegistered: false,
        };
      

      if (queryResult.address_components) {
        const provinceName = queryResult.address_components?.find(item => item.types.includes('administrative_area_level_1'))?.long_name;
        
        const provinceResult = await this.administrativeService.getProvinceDetailsByName(provinceName, language);

        response = {
          ...response,
          administrative: {
            province: {
              code: provinceResult?.code,
              name: provinceResult?.name,
              name_en: provinceResult?.name_en,
            },
          },
        }
      }
      // thêm vào phần province
      
      /* TO DO:
      Kiểm tra xem destination nào có trong database, nếu có thì query review, set isRegistered = true và gán review của destination đó vào */
      
      return right(Result.ok<SingleDestinationResponseDTO>(response));
    } catch (err) {
      return left(new AppErrors.UnexpectedError(err.toString()));
    }
  };
}
