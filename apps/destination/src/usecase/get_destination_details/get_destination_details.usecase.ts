import * as AppErrors from '@app/common/core/app.error';
import { Either, Result, left, right } from '@app/common/core/result';
import { UseCase } from '@app/common/core/usecase';
import { Injectable } from '@nestjs/common';
import { SingleDestinationResponseDTO } from '../../dtos/destination.response.dto';
import { GetDestinationDetailsRequestDTO } from '../../dtos/destinaiton.request.dto';
import { AdministrativeService } from 'apps/destination/administrative/administrative.service';
import * as DestinationErrors from '../errors/destination.errors';
import { DestinationService } from '../../destination.service';

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
    private readonly destinationService: DestinationService,
    private readonly administrativeService: AdministrativeService,
  ) {}

  execute = async (dto: GetDestinationDetailsRequestDTO): Promise<Response> => {
    try {
      const { place_id, language } = dto;

      // Gọi service của google, trả về query Result. Tạm thời chưa có type nào
      const destinationOrError = await this.destinationService.getDestinationByID(place_id, language);

      if (destinationOrError === undefined) {
        return left(new DestinationErrors.DestinationNotFound());
      }

      let response: SingleDestinationResponseDTO = {
          place_id: destinationOrError.place_id,
          name: destinationOrError.name,
          description: destinationOrError.description,
          location: {
              lat: destinationOrError.mapsFullDetails.geometry.location.lat,
              lng: destinationOrError.mapsFullDetails.geometry.location.lng,
          },
          mapsFullDetails: destinationOrError.mapsFullDetails,
          reviews: [],
          isRegistered: destinationOrError.isRegistered,
          isCached: destinationOrError.isCached,
        };
      

      if (destinationOrError.mapsFullDetails.address_components) {
        const provinceName = destinationOrError.mapsFullDetails.address_components?.find(item => item.types.includes('administrative_area_level_1'))?.long_name;
        
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
