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
import { DeleteTripDestinationDTO } from './delete_trip_destination.dto';
import { TripId } from 'apps/trip/src/entity/trip_id';
import { TripDayId } from 'apps/trip/trip_day/entity/trip_day_id';
import * as TripErrors from '../../errors/trip.errors';
import { TripDay } from 'apps/trip/trip_day/entity/trip_day.entity';
import { TripDestination } from 'apps/trip/trip_destination/entity/trip_destination.entity';
import { TripDestinationId } from '../../../../trip_destination/entity/trip_destination_id';

/* eslint-disable prettier/prettier */
type Response = Either<
  AppErrors.EntityNotFoundError | AppErrors.InvalidPayloadError | TripErrors.TripDoesNotBelongToUser,
  Result<void>
>;

type DeleteTripDestinationDTOWithUserId = {
    userId: string;
    request: DeleteTripDestinationDTO;
}

@Injectable()
export class DeleteTripDestinationUseCase implements UseCase<DeleteTripDestinationDTOWithUserId, Promise<Response>>
{
  constructor(
    private readonly tripService: TripService,
    @Inject(AUTH_SERVICE) private readonly authClient: ClientProxy,
  ) {}

  execute = async (payload: DeleteTripDestinationDTOWithUserId): Promise<Response> => {
    try {

      const { userId, request } = payload;
      const userIdOrError = new UniqueEntityID(userId);

      // kiểm tra xem user có tồn tại hay không
      const userOrError = await firstValueFrom(this.authClient.send('get_user_profile', { userId: userIdOrError.toString()})); 

      // // chưa handle trường hợp không có user

      const tripIdOrError = TripId.create(new UniqueEntityID(request.tripId));
      const tripDayIdOrError = TripDayId.create(new UniqueEntityID(request.tripDayId));
      const tripDestinationIdOrError = TripDestinationId.create(new UniqueEntityID(request.tripDestinationId));

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

      if (foundTripDay === undefined) {
        return left(new AppErrors.EntityNotFoundError('TripDay'));
      }

      // Kiểm tra trip destination có tồn tại hay không
      const foundTripDestination = foundTripDay.destinations.find((destination) => destination.tripDestinationId.equals(tripDestinationIdOrError));

      // console.log(foundTripDay.destinations);
      // console.log(tripDestinationIdOrError.getValue().toString())
      if (foundTripDestination === undefined) {
        return left(new AppErrors.EntityNotFoundError('TripDestination'));
      }

      // Xoá trip destination với TripDestinationId
      foundTripDay.destinations = foundTripDay.destinations.filter((destination) => !destination.tripDestinationId.equals(tripDestinationIdOrError));

      foundTripDay.destinations.forEach((destination) => {
        if (destination.position > foundTripDestination.position) {
          destination.position = destination.position-1;
        }
      });

      // Thay thế trip day ở trip ban đầu với trip days đã xoá destination
      trip.days = trip.days.map((day) => {
        if (day.tripDayId.equals(tripDayIdOrError)) {
          return foundTripDay;
        }
        return day;
      });

      const result = await this.tripService.updateTrip(trip);
      return right(Result.ok<void>());
    } catch (err) {
      Logger.error(err, err.stack, 'DeleteTripDestinationUseCase');
      // RPC Exception
      if (err.status === 404) {
        return left(new AppErrors.EntityNotFoundError('User'));
      }
      return left(new AppErrors.UnexpectedError(err));
    }
  };
}
