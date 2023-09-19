import { AUTH_SERVICE, DESTINATION_SERVICE } from '@app/common/global/services';
import * as AppErrors from '@app/common/core/app.error';
import { Either, Result, left, right } from '@app/common/core/result';
import { UseCase } from '@app/common/core/usecase';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { SingleTripResponseDTO } from 'apps/trip/src/dto/trip.dto';
import { TripService } from 'apps/trip/src/trip.service';
import { firstValueFrom } from 'rxjs';
import { UniqueEntityID } from '@app/common/core/domain/unique_entity_id';
import { GetTripDetailsDTO } from './get_trip_details.dto';
import { TripId } from 'apps/trip/src/entity/trip_id';
import * as TripErrors from '../../errors/trip.errors';
import {
  MultipleDestinationResponseDTO,
  SingleDestinationResponseDTO,
} from 'apps/destination/src/usecase/dtos/destination.dto';

/* eslint-disable prettier/prettier */
type Response = Either<
  AppErrors.InvalidPayloadError,
  Result<SingleTripResponseDTO>
>;

type GetTripDetailsWithUserIDDTO = {
    userId: string,
    request: GetTripDetailsDTO,
}

@Injectable()
export class GetTripDetailsUseCase
  implements UseCase<GetTripDetailsWithUserIDDTO, Promise<Response>>
{
  constructor(
    // check lại cái này
    private readonly tripService: TripService,
    @Inject(AUTH_SERVICE) private readonly authClient: ClientProxy,
    @Inject(DESTINATION_SERVICE) private readonly destinationClient: ClientProxy,
  ) {}

  execute = async (dto: GetTripDetailsWithUserIDDTO): Promise<Response> => {
    try {
      const { userId, request } = dto;

      const userOrError = await firstValueFrom(this.authClient.send('get_user_profile', { userId: userId})); 
      // chưa handle trường hợp không có user
      
      const tripIdOrError = TripId.create(new UniqueEntityID(request.tripId));

      // Kiểm tra trip có tồn tại hay không
      const trip = await this.tripService.getTripById(tripIdOrError);

      if (trip === undefined) {
        return left(new AppErrors.EntityNotFoundError('Trip'));
      }

      if (trip.userId.toString() !== userOrError.id) {
        return left(new TripErrors.TripDoesNotBelongToUser());
      }

      const result: SingleTripResponseDTO = {
        id: trip.tripId.getValue().toString(),
        userId: trip.userId.toString(),
        name: trip.name,
        description: trip.description,
        startAt: trip.startAt,
        createdAt: trip.createdAt,
        updatedAt: trip.updatedAt,
        isArchived: trip.isArchived,
        days: trip.days.map((day) => {
          return ({
            id: day.tripDayId.getValue().toString(),
            position: day.position,
            dayLength: day.destinations.length,
            startOffsetFromMidnight: day.startOffsetFromMidnight,
            destinations: day.destinations.map((destination) => {
              return ({
                id: destination.tripDestinationId.getValue().toString(),
                position: destination.position,
                type: destination.type,
                place_id: destination.place_id,
              })
            })
          })
        })
      };

      if (request.getFirstDestinationName) {
        const placeIds = [];
        result.days.forEach((day) => {
          if (day.destinations[0]) {
            placeIds.push(day.destinations[0].place_id);
          }
        });

        const destinationQueryResult : MultipleDestinationResponseDTO = await firstValueFrom(this.destinationClient.send('get_multiple_destinations', { place_ids: placeIds, language: request.language ?? 'vi'}));

        result.days.map((day) => {
          if (day.destinations[0]) {
            const destinationDetails = destinationQueryResult.destinations.find((destinationDetails : SingleDestinationResponseDTO) => destinationDetails.destinationId === day.destinations[0].place_id);
            if (destinationDetails === undefined) {
              Logger.log(`Place ${day.destinations[0].place_id} not found in query result. Left out of array`, 'GetTripDetailsUseCase');
            } else {
              day.firstDestinationName = destinationDetails.name;
            }
          }
          return day;
        })
        console.log(result);
      }

      return right(Result.ok<SingleTripResponseDTO>(result));
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log(err);
      return left(new AppErrors.UnexpectedError(err.toString()));
    }
  };
}
