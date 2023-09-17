/* eslint-disable @typescript-eslint/no-unused-vars */
import * as AppErrors from '@app/common/core/app.error';
import { UniqueEntityID } from '@app/common/core/domain/unique_entity_id';
import { Either, Result, left, right } from '@app/common/core/result';
import { UseCase } from '@app/common/core/usecase';
import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { TripService } from 'apps/trip/src/trip.service';
import { CreateTripDTO } from './create_trip.dto';
import { AUTH_SERVICE } from '@app/common/global/services';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { Trip } from 'apps/trip/src/entity/trip.entity';
import { TripDay } from 'apps/trip/trip_day/entity/trip_day.entity';

/* eslint-disable prettier/prettier */
type Response = Either<
  AppErrors.EntityNotFoundError | AppErrors.InvalidPayloadError,
  Result<void>
>;

type CreateTripDTOWithUserId = {
    userId: string;
    request: CreateTripDTO;
}

@Injectable()
export class CreateTripUseCase implements UseCase<CreateTripDTOWithUserId, Promise<Response>>
{
  constructor(
    private readonly tripService: TripService,
    @Inject(AUTH_SERVICE) private readonly authClient: ClientProxy,
  ) {}

  execute = async (payload: CreateTripDTOWithUserId): Promise<Response> => {
    try {

      const { userId, request } = payload;
      const userIdOrError = new UniqueEntityID(userId);

      // kiểm tra xem user có tồn tại hay không
      const userOrError = await firstValueFrom(this.authClient.send('get_user_profile', { userId: userId})); 
      // chưa handle trường hợp không có user

      const tripOrError = Trip.create({
        name: request.name,
        userId: new UniqueEntityID(userOrError.id),
        description: request.description,
        isArchived: false,
        startAt: request.startAt,
        createdAt: new Date(),
        updatedAt: new Date(),
        days: [],
      });

      if (tripOrError.isFailure) {
        return left(new AppErrors.UnexpectedError("Can not create Trip for unknown reason"));
      }

      for (let i = 0; i < request.tripLength; i++) {
        const tripDayOrError = TripDay.create({
          position: i,
          startOffsetFromMidnight: request.initialStartOffsetFromMidnight,
          destinations: [],
        });
        if (tripDayOrError.isFailure) {
          return left(new AppErrors.UnexpectedError("Can not create Trip for unknown reason"));
        }
        tripOrError.getValue().days.push(tripDayOrError.getValue());
      }

      // add days to trip days

      const result = await this.tripService.createTrip(tripOrError.getValue());
      Logger.log(result);
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
            destinations: [],
          };
        }).sort((a, b) => a.position - b.position),
      }));
    } catch (err) {
      Logger.error(err, err.stack);
      // RPC Exception
      if (err.status === 404) {
        return left(new AppErrors.EntityNotFoundError('User'));
      }
      return left(new AppErrors.UnexpectedError(err));
    }
  };
}
