/* eslint-disable @typescript-eslint/no-unused-vars */
import * as AppErrors from '@app/common/core/app.error';
import { UniqueEntityID } from '@app/common/core/domain/unique_entity_id';
import { Either, Result, left, right } from '@app/common/core/result';
import { UseCase } from '@app/common/core/usecase';
import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { TripService } from 'apps/trip/src/trip.service';
import { CreateTripDayDTO } from './create_trip_day.dto';
import { AUTH_SERVICE } from '@app/common/global/services';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { firstValueFrom, lastValueFrom } from 'rxjs';
import * as TripErrors from '../../errors/trip.errors';
import { TripDay } from 'apps/trip/trip_day/entity/trip_day.entity';
import { TripId } from 'apps/trip/src/entity/trip_id';

/* eslint-disable prettier/prettier */
type Response = Either<
  AppErrors.EntityNotFoundError | AppErrors.InvalidPayloadError | TripErrors.TripDayPositionInvalidError| TripErrors.TripDoesNotBelongToUser,
  Result<void>
>;

type CreateTripDayDTOWithUserId = {
    userId: string;
    request: CreateTripDayDTO;
}

@Injectable()
export class CreateTripDayUseCase implements UseCase<CreateTripDayDTOWithUserId, Promise<Response>>
{
  constructor(
    private readonly tripService: TripService,
    @Inject(AUTH_SERVICE) private readonly authClient: ClientProxy,
  ) {}

  execute = async (payload: CreateTripDayDTOWithUserId): Promise<Response> => {
    try {

      const { userId, request } = payload;
      const userIdOrError = new UniqueEntityID(userId);

      // kiểm tra xem user có tồn tại hay không
      const userOrError = await firstValueFrom(this.authClient.send('get_user_profile', { userId: userId})); 

      const tripIdOrError = TripId.create(new UniqueEntityID(request.tripId));
      const tripOrError = await this.tripService.getTripById(tripIdOrError);

      // kiểm tra xem tripday có vị trí hợp lệ không
      const tripLength = tripOrError.days.length;
      if (request.position > tripLength) {
        return left(new TripErrors.TripDayPositionInvalidError(tripLength.toString()));
      }

      const newDays: TripDay[] = [];

      //dời các trip phía sau về sau 1 vị trí
      tripOrError.days.forEach((day) => {
        if (day.position >= request.position) {
          day.position += 1;
        }
        newDays.push(day);
      });

      const tripDayOrError = TripDay.create({
          position: request.position,
          startOffsetFromMidnight: request.startOffsetFromMidnight,
          destinations: [],
       });

      if (tripDayOrError.isFailure) {
        return left(new AppErrors.UnexpectedError("Can not create Trip day for unknown reason"));
      }

      // insert tripday vào vị trí mong muốn
      newDays.splice(request.position, 0, tripDayOrError.getValue());

      // thay đổi vị trí các trip sau tripday
      tripOrError.days = newDays;
      
      const result = await this.tripService.updateTrip(tripOrError);

      return right(Result.ok<any>());
    } catch (err) {
      // RPC Exception
      
      if (err.status === 404) {
        return left(new AppErrors.EntityNotFoundError('User'));
      }
      return left(new AppErrors.UnexpectedError(err));
    }
  };
}
