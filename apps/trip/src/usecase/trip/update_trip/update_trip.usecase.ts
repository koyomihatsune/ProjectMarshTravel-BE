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
import { UpdateTripDTO } from './update_trip.dto';
import { TripId } from 'apps/trip/src/entity/trip_id';
import { TripDay } from 'apps/trip/trip_day/entity/trip_day.entity';
import * as TripErrors from '../../errors/trip.errors';

/* eslint-disable prettier/prettier */
type Response = Either<
  AppErrors.EntityNotFoundError | AppErrors.InvalidPayloadError | TripErrors.TripDoesNotBelongToUser,
  Result<void>
>;

type UpdateTripDTOWithUserId = {
    userId: string;
    request: UpdateTripDTO;
}

@Injectable()
export class UpdateTripUseCase implements UseCase<UpdateTripDTOWithUserId, Promise<Response>>
{
  constructor(
    private readonly tripService: TripService,
    @Inject(AUTH_SERVICE) private readonly authClient: ClientProxy,
  ) {}

  execute = async (payload: UpdateTripDTOWithUserId): Promise<Response> => {
    try {

      const { userId, request } = payload;
      const userIdOrError = new UniqueEntityID(userId);

      // kiểm tra xem user có tồn tại hay không
      const userOrError = await firstValueFrom(this.authClient.send('get_user_profile', { userId: userId})); 
      // Đã handle trường hợp chưa có user ở dưới catch

      const tripIdOrError = TripId.create(new UniqueEntityID(request.tripId));

      // Kiểm tra trip có tồn tại hay không
      const trip = await this.tripService.getTripById(tripIdOrError);

      if (trip === undefined) {
        return left(new AppErrors.EntityNotFoundError('Trip'));
      }

      if (trip.userId.toString() !== userOrError.id) {
        return left(new TripErrors.TripDoesNotBelongToUser());
      }

      // create new trip with updated datas
      
      if (request.name) trip.name = request.name;
      if (request.description) trip.description = request.description;
      if (request.startAt) trip.startAt = request.startAt;
      if (request.isArchived) trip.isArchived = request.isArchived;
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
