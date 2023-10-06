import { UniqueEntityID } from '@app/common/core/domain/unique_entity_id';
import { Either, Result, left, right } from '@app/common/core/result';
import { UseCase } from '@app/common/core/usecase';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { UserId } from '../../domain/user_id';
import { UsersService } from '../../users.service';
import {
  GetPublicUserProfilesDTO,
  MultiplePublicUserProfileResponseDTO,
} from './get_public_profiles.dto';
import * as AppErrors from '@app/common/core/app.error';

type Response = Either<
  AppErrors.EntityNotFoundError | AppErrors.UnexpectedError,
  Result<MultiplePublicUserProfileResponseDTO> | Result<void>
>;

@Injectable()
export class GetPublicUserProfilesUseCase
  implements UseCase<GetPublicUserProfilesDTO, Promise<Response>>
{
  constructor(private readonly userService: UsersService) {}

  execute = async (request: GetPublicUserProfilesDTO): Promise<Response> => {
    try {
      let { userIds } = request;
      if (typeof userIds === 'string') {
        userIds = [userIds];
      }

      const userIdsOrError = userIds.map((userId) =>
        UserId.create(new UniqueEntityID(userId)),
      );

      const users = await this.userService.getUsers(userIdsOrError);
      const result = {
        users: users.map((user) => {
          return {
            id: user.id.toString(),
            name: user.name.value,
            username: user.username.value,
            avatar: user.avatarUrl,
          };
        }),
      };

      return right(Result.ok<MultiplePublicUserProfileResponseDTO>(result));
    } catch (err) {
      Logger.error(err, err.stack);
      if (err instanceof NotFoundException) {
        return left(new AppErrors.EntityNotFoundError('User'));
      }
      return left(new AppErrors.UnexpectedError(err.message));
    }
  };
}
