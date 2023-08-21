/* eslint-disable @typescript-eslint/no-unused-vars */
import * as AppErrors from '@app/common/core/app.error';
import { UniqueEntityID } from '@app/common/core/domain/unique_entity_id';
import { Either, Result, left, right } from '@app/common/core/result';
import { UseCase } from '@app/common/core/usecase';
import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { TripService } from 'apps/trip/src/trip.service';
import { CreateTripDayDTO } from './create_trip_day.dto';
import { AUTH_SERVICE } from '@app/common/auth/services';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { firstValueFrom, lastValueFrom } from 'rxjs';
import * as CreateTripDayUseCaseErrors from './create_trip_day.errors';
import { TripDay } from 'apps/trip/trip_day/entity/trip_day.entity';
import { TripId } from 'apps/trip/src/entity/trip_id';

/* eslint-disable prettier/prettier */
type Response = Either<
  AppErrors.EntityNotFoundError | AppErrors.InvalidPayloadError | CreateTripDayUseCaseErrors.TripDayPositionInvalidError| CreateTripDayUseCaseErrors.TripDoesNotBelongToUser,
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
      const tripOrError = await this.tripService.getTripWithId(tripIdOrError);

      // kiểm tra xem tripday có vị trí hợp lệ không

      const tripLength = tripOrError.days.length;
      if (request.position > tripLength) {
        return left(new CreateTripDayUseCaseErrors.TripDayPositionInvalidError());
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

      const result = await this.tripService.updateTrip(tripOrError);

      return right(Result.ok<any>({
        id: result.id.toString(),
        name: result.name,
        userId: result.userId.toString(),
        description: result.description,
        isArchived: result.isArchived,
        startAt: result.startAt,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt,
        days: result.days.map((day) => {
          return {
            id: day.id.toString(),
            position: day.position,
            startOffsetFromMidnight: day.startOffsetFromMidnight,
            destinations: day.destinations.map((destination) => {
              return {
                id: destination.id.toString(),
                position: destination.position,
                name: "test",
                address: "test",
                lat: "test",
                lng: "test",
                createdAt: "test",
                updatedAt: "test",
              };
            }),
          };
        }),
      }));
    } catch (err) {
      // RPC Exception
      if (err.status === 404) {
        return left(new AppErrors.EntityNotFoundError('User'));
      }
      return left(new AppErrors.UnexpectedError(err));
    }
  };
}
