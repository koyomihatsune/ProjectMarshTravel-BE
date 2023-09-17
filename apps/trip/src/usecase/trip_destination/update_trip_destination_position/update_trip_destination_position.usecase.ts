/* eslint-disable @typescript-eslint/no-unused-vars */
import * as AppErrors from '@app/common/core/app.error';
import { UniqueEntityID } from '@app/common/core/domain/unique_entity_id';
import { Either, Result, left, right } from '@app/common/core/result';
import { UseCase } from '@app/common/core/usecase';
import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { TripService } from 'apps/trip/src/trip.service';
import { AUTH_SERVICE } from '@app/common/global/services';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { UpdateTripDestinationPositionDTO } from './update_trip_destination_position.dto';
import { TripId } from 'apps/trip/src/entity/trip_id';
import { TripDayId } from 'apps/trip/trip_day/entity/trip_day_id';
import * as TripErrors from '../../errors/trip.errors';
import { TripDay } from 'apps/trip/trip_day/entity/trip_day.entity';
import { isValidPositionArray } from '@app/common/others/utilities';

/* eslint-disable prettier/prettier */
type Response = Either<
  AppErrors.EntityNotFoundError | AppErrors.InvalidPayloadError | TripErrors.TripDoesNotBelongToUser | TripErrors.PositionSequenceInvalidError,
  Result<void>
>;

type UpdateTripDestinationPositionDTOWithUserId = {
    userId: string;
    request: UpdateTripDestinationPositionDTO;
}

@Injectable()
export class UpdateTripDestinationPositionUseCase implements UseCase<UpdateTripDestinationPositionDTOWithUserId, Promise<Response>>
{
  constructor(
    private readonly tripService: TripService,
    @Inject(AUTH_SERVICE) private readonly authClient: ClientProxy,
  ) {}

  execute = async (payload: UpdateTripDestinationPositionDTOWithUserId): Promise<Response> => {
    try {

      const { userId, request } = payload;
      const userIdOrError = new UniqueEntityID(userId);

      // kiểm tra xem user có tồn tại hay không
      const userOrError = await firstValueFrom(this.authClient.send('get_user_profile', { userId: userId})); 

      const tripIdOrError = TripId.create(new UniqueEntityID(request.tripId));
      const tripDayIdOrError = TripDayId.create(new UniqueEntityID(request.tripDayId));

      // Kiểm tra trip có tồn tại hay không
      const tripOrError = await this.tripService.getTripById(tripIdOrError);

      if (tripOrError === undefined) {
        return left(new AppErrors.EntityNotFoundError('Trip'));
      }

      if (tripOrError.userId.toString() !== userOrError.id) {
        return left(new TripErrors.TripDoesNotBelongToUser());
      }
      
      // Kiểm tra trip day tồn tại hay không
      const tripDayIndex = tripOrError.days.findIndex((day) => day.tripDayId.equals(tripDayIdOrError));

      if (tripDayIndex === undefined) {
        return left(new AppErrors.EntityNotFoundError('TripDay'));
      }

      if(!isValidPositionArray(tripOrError.days[tripDayIndex].destinations.length, request.positions)) {
        return left(new TripErrors.PositionSequenceInvalidError());
      }

      const positionToIndexMap = new Map<number, number>();
      request.positions.forEach((position, index) => {
        positionToIndexMap.set(position, index);
      });

      // Replace positions of items and sort the array by position
      const tempDestinations = tripOrError.days[tripDayIndex].destinations.map((destination) => {
        destination.position = positionToIndexMap.get(destination.position);
        return destination;
      });
      tempDestinations.sort((a, b) => a.position - b.position);
      tripOrError.days[tripDayIndex].destinations = tempDestinations;
    
      await this.tripService.updateTrip(tripOrError);
      return right(Result.ok<void>());
    } catch (err) {
      // RPC Exception
      if (err.status === 404) {
        return left(new AppErrors.EntityNotFoundError('User'));
      }
      return left(new AppErrors.UnexpectedError(err));
    }
  };
}
