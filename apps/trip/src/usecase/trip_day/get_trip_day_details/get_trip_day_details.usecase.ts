import { AUTH_SERVICE, DESTINATION_SERVICE } from '@app/common/global/services';
import * as AppErrors from '@app/common/core/app.error';
import { Either, Result, left, right } from '@app/common/core/result';
import { UseCase } from '@app/common/core/usecase';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { SingleTripDayResponseDTO } from 'apps/trip/src/dtos/trip.response.dto';
import { TripService } from 'apps/trip/src/trip.service';
import { firstValueFrom } from 'rxjs';
import { UniqueEntityID } from '@app/common/core/domain/unique_entity_id';
import { GetTripDayDetailsDTO } from './get_trip_day_details.dto';
import { TripId } from 'apps/trip/src/entity/trip_id';
import * as TripErrors from '../../errors/trip.errors';
import {
  MultipleDestinationResponseDTO,
  SingleDestinationResponseDTO,
} from 'apps/destination/src/dtos/destination.response.dto';
import { TripDayId } from 'apps/trip/trip_day/entity/trip_day_id';
import { UserProfileResponseDTO } from '../../../../../auth/user/usecase/get_profile/get_profile.dto';

/* eslint-disable prettier/prettier */
type Response = Either<
  AppErrors.InvalidPayloadError,
  Result<SingleTripDayResponseDTO>
>;

type GetTripDayDetailsWithUserIDDTO = {
    userId: string,
    request: GetTripDayDetailsDTO,
}

@Injectable()
export class GetTripDayDetailsUseCase
  implements UseCase<GetTripDayDetailsWithUserIDDTO, Promise<Response>>
{
  constructor(
    // check lại cái này
    private readonly tripService: TripService,
    @Inject(AUTH_SERVICE) private readonly authClient: ClientProxy,
    @Inject(DESTINATION_SERVICE) private readonly destinationClient: ClientProxy,
  ) {}

  execute = async (dto: GetTripDayDetailsWithUserIDDTO): Promise<Response> => {
    try {
      const { userId, request } = dto;

      const userOrError = await firstValueFrom<UserProfileResponseDTO>(this.authClient.send('get_user_profile', { userId: userId})); 

      // chưa handle trường hợp không có user
      
      const tripIdOrError = TripId.create(new UniqueEntityID(request.tripId));
      const tripDayIdOrError = TripDayId.create(new UniqueEntityID(request.tripDayId));

      // Kiểm tra trip có tồn tại hay không
      const trip = await this.tripService.getTripById(tripIdOrError);

      if (trip === undefined) {
        return left(new AppErrors.EntityNotFoundError('Trip'));
      }

      if (trip.userId.toString() !== userOrError.id) {
        return left(new TripErrors.TripDoesNotBelongToUser());
      }

      // Kiểm tra trip day tồn tại hay không
      const tripDay = trip.days.find((day) => day.tripDayId.equals(tripDayIdOrError));

      if (tripDay === undefined) {
        return left(new AppErrors.EntityNotFoundError('TripDay'));
      }


      const result: SingleTripDayResponseDTO = {
        id: tripDay.tripDayId.getValue().toString(),
        position: tripDay.position,
        startOffsetFromMidnight: tripDay.startOffsetFromMidnight,
        dayLength: tripDay.destinations.length,
        destinations: [],
      };

      // Lấy list place_id để query bên Destinations service
      const placeIds = tripDay.destinations.map((destination) => {
        return destination.place_id
      });

      // Query lấy details bên Destinations service
      const destinationQueryResult : MultipleDestinationResponseDTO = await firstValueFrom(this.destinationClient.send('get_multiple_destinations', { place_ids: placeIds, language: request.language ?? 'vi'}));
         
      // push lần lượt vào từng destination của day bằng cách pick placeid tương ứng
      tripDay.destinations.forEach((destination) => {
        const destinationDetails = destinationQueryResult.destinations.find((destinationDetails : SingleDestinationResponseDTO) => destinationDetails.place_id === destination.place_id);

        if (destinationDetails === undefined) {
          Logger.log(`Place ${destination.place_id} not found in query result. Left out of array`, 'GetTripDetailsUseCase');
          result.destinations.push({
            id: destination.tripDestinationId.getValue().toString(),
            place_id: destination.place_id,
            name: destinationDetails.name,
            position: destination.position,
            type: destination.type,
            isRegistered: false,
            // sửa lại sau khi đã làm cache ở Destination service
            isError: true,
            errorDetails: `Place ${destination.place_id} not found in query result. Google Maps can't find this place.`
          })
        } else {
          Logger.log("Found destination details: " + destinationDetails.name,'GetTripDetailsUseCase');
          result.destinations.push({
            id: destination.tripDestinationId.getValue().toString(),
            place_id: destination.place_id,
            name: destinationDetails.name,
            position: destination.position,
            type: destination.type,
            location: destinationDetails.location,
            mapsFullDetails: destinationDetails.mapsFullDetails,
            image_urls: [],
            isRegistered: false,
            // sửa lại sau khi đã làm cache ở Destination service
            isError: false,
          })
        }
      }
      );

      // sort lại theo position
      result.destinations.sort((a, b) => a.position - b.position);

      return right(Result.ok<SingleTripDayResponseDTO>(result));
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log(err);
      return left(new AppErrors.UnexpectedError(err.toString()));
    }
  };
}
