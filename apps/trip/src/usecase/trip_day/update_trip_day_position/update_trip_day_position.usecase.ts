/* eslint-disable @typescript-eslint/no-unused-vars */
import * as AppErrors from '@app/common/core/app.error';
import { UniqueEntityID } from '@app/common/core/domain/unique_entity_id';
import { Either, Result, left, right } from '@app/common/core/result';
import { UseCase } from '@app/common/core/usecase';
import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { TripService } from 'apps/trip/src/trip.service';
import { AUTH_SERVICE } from '@app/common/auth/services';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { UpdateTripDayPositionDTO } from './update_trip_day_position.dto';
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

type UpdateTripDayPositionDTOWithUserId = {
    userId: string;
    request: UpdateTripDayPositionDTO;
}

@Injectable()
export class UpdateTripDayPositionUseCase implements UseCase<UpdateTripDayPositionDTOWithUserId, Promise<Response>>
{
  constructor(
    private readonly tripService: TripService,
    @Inject(AUTH_SERVICE) private readonly authClient: ClientProxy,
  ) {}

  execute = async (payload: UpdateTripDayPositionDTOWithUserId): Promise<Response> => {
    try {

      const { userId, request } = payload;
      const userIdOrError = new UniqueEntityID(userId);

      // kiểm tra xem user có tồn tại hay không
      const userOrError = await firstValueFrom(this.authClient.send('get_user_profile', { userId: userId})); 

      const tripIdOrError = TripId.create(new UniqueEntityID(request.tripId));

      // Kiểm tra trip có tồn tại hay không
      const trip = await this.tripService.getTripById(tripIdOrError);

      if (trip === undefined) {
        return left(new AppErrors.EntityNotFoundError('Trip'));
      }

      if (trip.userId.toString() !== userOrError.id) {
        return left(new TripErrors.TripDoesNotBelongToUser());
      }

      if(!isValidPositionArray(trip.days.length, request.positions)) {
        return left(new TripErrors.PositionSequenceInvalidError());
      }

      const positionToIndexMap = new Map<number, number>();
      request.positions.forEach((position, index) => {
        positionToIndexMap.set(position, index);
      });

      // Replace positions of items and sort the array by position
      const tempDays = trip.days.map((day) => {
        day.position = positionToIndexMap.get(day.position);
        return day;
      });
      tempDays.sort((a, b) => a.position - b.position);
      trip.days = tempDays;
    
      await this.tripService.updateTrip(trip);
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
