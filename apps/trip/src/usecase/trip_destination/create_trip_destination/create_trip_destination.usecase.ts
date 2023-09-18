/* eslint-disable @typescript-eslint/no-unused-vars */
import * as AppErrors from '@app/common/core/app.error';
import { UniqueEntityID } from '@app/common/core/domain/unique_entity_id';
import { Either, Result, left, right } from '@app/common/core/result';
import { UseCase } from '@app/common/core/usecase';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { TripService } from 'apps/trip/src/trip.service';
import { CreateTripDestinationDTO } from './create_trip_destination.dto';
import { AUTH_SERVICE } from '@app/common/global/services';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import * as TripErrors from '../../errors/trip.errors';
import { TripId } from 'apps/trip/src/entity/trip_id';
import { TripDayId } from 'apps/trip/trip_day/entity/trip_day_id';
import { TripDestination } from 'apps/trip/trip_destination/entity/trip_destination.entity';

/* eslint-disable prettier/prettier */
type Response = Either<
  AppErrors.EntityNotFoundError | AppErrors.InvalidPayloadError | TripErrors.TripDayPositionInvalidError| TripErrors.TripDoesNotBelongToUser,
  Result<void>
>;

type CreateTripDestinationDTOWithUserId = {
    userId: string;
    request: CreateTripDestinationDTO;
}

@Injectable()
export class CreateTripDestinationUseCase implements UseCase<CreateTripDestinationDTOWithUserId, Promise<Response>>
{
  constructor(
    private readonly tripService: TripService,
    @Inject(AUTH_SERVICE) private readonly authClient: ClientProxy,
  ) {}

  execute = async (payload: CreateTripDestinationDTOWithUserId): Promise<Response> => {
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

      if (tripDayIndex === -1) {
        return left(new AppErrors.EntityNotFoundError('TripDay'));
      }

      const newDestinations: TripDestination[] = [];

      //dời các trip phía sau về sau 1 vị trí
      tripOrError.days[tripDayIndex].destinations.forEach((destination) => {
        if (destination.position >= request.position) {
          destination.position += 1;
        }
        newDestinations.push(destination);
      });

      const tripDestinationOrError = TripDestination.create({
          position: request.position,
          place_id: request.place_id,
          type: 'destination',
       });

      // Kiểm tra xem trip destination có phải là place_id hợp lệ không

      if (tripDestinationOrError.isFailure) {
        return left(new AppErrors.UnexpectedError("Can not create Trip destination for unknown reason"));
      }

      // insert tripdestination vào vị trí mong muốn
      newDestinations.splice(request.position, 0, tripDestinationOrError.getValue());

      // cập nhật lại destination vào tripday của trip
      tripOrError.days[tripDayIndex].destinations = newDestinations;
    
      const result = await this.tripService.updateTrip(tripOrError);

      return right(Result.ok<any>());
    } catch (err) {
      // RPC Exception
      Logger.error(err, err.stack, 'CreateTripDestinationUseCase');
      if (err.status === 404) {
        return left(new AppErrors.EntityNotFoundError('User'));
      }
      return left(new AppErrors.UnexpectedError(err));
    }
  };
}
