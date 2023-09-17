/* eslint-disable @typescript-eslint/no-unused-vars */
import * as AppErrors from '@app/common/core/app.error';
import { UniqueEntityID } from '@app/common/core/domain/unique_entity_id';
import { Either, Result, left, right } from '@app/common/core/result';
import { UseCase } from '@app/common/core/usecase';
import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { TripService } from 'apps/trip/src/trip.service';
import { AUTH_SERVICE } from '@app/common/global/services';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { firstValueFrom, lastValueFrom } from 'rxjs';
import { UpdateTripDayDTO } from './update_trip_day.dto';
import { TripId } from 'apps/trip/src/entity/trip_id';
import { TripDayId } from 'apps/trip/trip_day/entity/trip_day_id';
import * as TripErrors from '../../errors/trip.errors';
import { TripDay } from 'apps/trip/trip_day/entity/trip_day.entity';

/* eslint-disable prettier/prettier */
type Response = Either<
  AppErrors.EntityNotFoundError | AppErrors.InvalidPayloadError | TripErrors.TripDoesNotBelongToUser,
  Result<void>
>;

type UpdateTripDayDTOWithUserId = {
    userId: string;
    request: UpdateTripDayDTO;
}

@Injectable()
export class UpdateTripDayUseCase implements UseCase<UpdateTripDayDTOWithUserId, Promise<Response>>
{
  constructor(
    private readonly tripService: TripService,
    @Inject(AUTH_SERVICE) private readonly authClient: ClientProxy,
  ) {}

  execute = async (payload: UpdateTripDayDTOWithUserId): Promise<Response> => {
    try {

      const { userId, request } = payload;
      const userIdOrError = new UniqueEntityID(userId);

      // kiểm tra xem user có tồn tại hay không
      const userOrError = await firstValueFrom(this.authClient.send('get_user_profile', { userId: userId})); 

      // // chưa handle trường hợp không có user

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

      // update StartOffsetFromMidnight
      const newTripDay = TripDay.create({
        position: tripDay.position,
        startOffsetFromMidnight: request.startOffsetFromMidnight,
        destinations: tripDay.destinations,
      }, tripDay.tripDayId.getValue());

      if (newTripDay.isFailure) {
        return left(new AppErrors.UnexpectedError("Can not update Trip day for unknown reason"));
      }

      // update trip day
      trip.days[trip.days.findIndex((day) => day.tripDayId.equals(tripDayIdOrError))] = newTripDay.getValue();

      // update trip
      const result = await this.tripService.updateTrip(trip);
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
