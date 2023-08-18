/* eslint-disable @typescript-eslint/no-unused-vars */
import * as AppErrors from '@app/common/core/app.error';
import { UniqueEntityID } from '@app/common/core/domain/unique_entity_id';
import { Either, Result, left, right } from '@app/common/core/result';
import { UseCase } from '@app/common/core/usecase';
import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { TripService } from 'apps/trip/src/trip.service';
import { CreateTripDTO } from './create_trip.dto';
import { AUTH_SERVICE } from '@app/common/auth/services';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { firstValueFrom, lastValueFrom } from 'rxjs';
import { Trip } from 'apps/trip/src/entity/trip.entity';
import { User } from 'apps/auth/user/domain/user.entity';
import { UserProfileResponseDTO } from 'apps/auth/user/usecase/get_profile/get_profile.dto';
import { SingleTripResponseDTO } from 'apps/trip/src/dto/trip.dto';

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

      // // chưa handle trường hợp không có user

      const tripOrError = Trip.create({
        name: request.name,
        userId: new UniqueEntityID(userOrError.id),
        description: request.description,
        isArchived: false,
        startAt: request.startAt,
        tripLength: request.tripLength,
        createdAt: new Date(),
        updatedAt: new Date(),
        days: [],
      });

      if (tripOrError.isFailure) {
        return left(new AppErrors.UnexpectedError("Can not create Trip for unknown reason"));
      }

      const result = await this.tripService.createTrip(tripOrError.getValue());
      return right(Result.ok<any>({
        id: result.id.toString(),
        name: result.name,
        userId: result.userId.toString(),
        description: result.description,
        isArchived: result.isArchived,
        startAt: result.startAt,
        tripLength: result.tripLength,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt,
        days: [],
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
