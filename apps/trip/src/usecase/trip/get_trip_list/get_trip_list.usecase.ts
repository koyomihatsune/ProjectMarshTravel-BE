import { AUTH_SERVICE } from '@app/common/global/services';
import * as AppErrors from '@app/common/core/app.error';
import { Either, Result, left, right } from '@app/common/core/result';
import { UseCase } from '@app/common/core/usecase';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { MultipleTripResponseWithoutDaysDTO } from 'apps/trip/src/dtos/trip.response.dto';
import { TripService } from 'apps/trip/src/trip.service';
import { firstValueFrom } from 'rxjs';
import { UniqueEntityID } from '@app/common/core/domain/unique_entity_id';
import { UserId } from 'apps/auth/user/domain/user_id';

/* eslint-disable prettier/prettier */
type Response = Either<
  AppErrors.InvalidPayloadError,
  Result<MultipleTripResponseWithoutDaysDTO>
>;

type GetTripListPaginationWithUserIdDTO = {
    userId: string;
    isArchived: boolean;
    page: number;
    limit: number;
}

@Injectable()
export class GetTripListPaginationUseCase
  implements UseCase<GetTripListPaginationWithUserIdDTO, Promise<Response>>
{
  constructor(
    // check lại cái này
    private readonly tripService: TripService,
    @Inject(AUTH_SERVICE) private readonly authClient: ClientProxy,
  ) {}

  execute = async (dto: GetTripListPaginationWithUserIdDTO): Promise<Response> => {
    try {
      const { userId, isArchived, page, limit } = dto;

      const userOrError = await firstValueFrom(this.authClient.send('get_user_profile', { userId: userId})); 

      const userIdOrError = UserId.create(new UniqueEntityID(userOrError.id));

      // chưa handle trường hợp không có user
      
      const queryResult = await this.tripService.getTripsByUserIdPagination(userIdOrError, isArchived, page, limit);

      const result: MultipleTripResponseWithoutDaysDTO = {
        list: [],
        page: queryResult.page,
        totalPage: queryResult.totalPage
      };

      queryResult.result.forEach((trip) => {
        result.list.push({ 
          id: trip.tripId.getValue().toString(),
          userId: trip.userId.toString(),
          name: trip.name,
          description: trip.description,
          startAt: trip.startAt,
          createdAt: trip.createdAt,
          updatedAt: trip.updatedAt,
          isArchived: trip.isArchived,
          isDeleted: trip.isDeleted,
          daysLength: trip.days.length,
        })
      })
      
      result.list.sort((a, b) => (a.startAt > b.startAt) ? -1 : 1);

      return right(Result.ok<MultipleTripResponseWithoutDaysDTO>(result));
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log(err);
      return left(new AppErrors.UnexpectedError(err.toString()));
    }
  };
}
