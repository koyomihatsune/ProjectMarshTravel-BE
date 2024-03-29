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
import { DeleteTripDayDTO } from './delete_trip_day.dto';
import { TripId } from 'apps/trip/src/entity/trip_id';
import { TripDayId } from 'apps/trip/trip_day/entity/trip_day_id';
import * as TripErrors from '../../errors/trip.errors';
import { TripDay } from 'apps/trip/trip_day/entity/trip_day.entity';

/* eslint-disable prettier/prettier */
type Response = Either<
  AppErrors.EntityNotFoundError | AppErrors.InvalidPayloadError | TripErrors.TripDoesNotBelongToUser,
  Result<void>
>;

type DeleteTripDayDTOWithUserId = {
    userId: string;
    request: DeleteTripDayDTO;
}

@Injectable()
export class DeleteTripDayUseCase implements UseCase<DeleteTripDayDTOWithUserId, Promise<Response>>
{
  constructor(
    private readonly tripService: TripService,
    @Inject(AUTH_SERVICE) private readonly authClient: ClientProxy,
  ) {}

  execute = async (payload: DeleteTripDayDTOWithUserId): Promise<Response> => {
    try {

      const { userId, request } = payload;
      const userIdOrError = new UniqueEntityID(userId);

      // kiểm tra xem user có tồn tại hay không
      const userOrError = await firstValueFrom(this.authClient.send('get_user_profile', { userId: userIdOrError.toString()})); 

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
      const foundTripDay = trip.days.find((day) => day.tripDayId.equals(tripDayIdOrError));

      // delete the tripday that match id from trip.days

      if (foundTripDay === undefined) {
        return left(new AppErrors.EntityNotFoundError('TripDay'));
      }

      // delete trip day with provided tripDayId
      trip.days = trip.days.filter((day) => !day.tripDayId.equals(tripDayIdOrError));

      trip.days.forEach((day) => {
        if (day.position > foundTripDay.position) {
          day.position = day.position-1;
        }
      });

      const result = await this.tripService.updateTrip(trip);
      return right(Result.ok<void>());
    } catch (err) {
      Logger.error(err, err.stack, 'DeleteTripDayUseCase');
      // RPC Exception
      if (err.status === 404) {
        return left(new AppErrors.EntityNotFoundError('User'));
      }
      return left(new AppErrors.UnexpectedError(err));
    }
  };
}
