import { UniqueEntityID } from '@app/common/core/domain/unique_entity_id';
import { Either, Result, left, right } from '@app/common/core/result';
import { UseCase } from '@app/common/core/usecase';
import { Injectable } from '@nestjs/common';
import { UserId } from '../../domain/user_id';
import { UsersService } from '../../users.service';
import * as AppErrors from '@app/common/core/app.error';
import { UpdateUserProfileDTO } from './update_profile.dto';
import { UserName } from '../../domain/user_name';
import { UserDOB } from '../../domain/user_dob';
import { UserUsername } from '../../domain/user_username';
import * as UpdateUserProfileUseCaseError from './update_profile.error';

type Response = Either<
  | AppErrors.EntityNotFoundError
  | AppErrors.InvalidPayloadError
  | UpdateUserProfileUseCaseError.UsernameAlreadyTaken,
  Result<void>
>;

type UpdateUserProfileDTOWithID = {
  userId: string;
  request: UpdateUserProfileDTO;
};

@Injectable()
export class UpdateUserProfileUseCase
  implements UseCase<UpdateUserProfileDTOWithID, Promise<Response>>
{
  constructor(private readonly userService: UsersService) {}

  execute = async (payload: UpdateUserProfileDTOWithID): Promise<Response> => {
    try {
      const { userId, request } = payload;
      const userIdOrError = UserId.create(new UniqueEntityID(userId));

      const user = await this.userService.getUser(userIdOrError);

      if (user === undefined) {
        return left(new AppErrors.EntityNotFoundError('User'));
      }

      let dto = {};
      let userNameOrError;
      let userUserNameOrError;
      let userDOBOrError;

      if (request.name) {
        userNameOrError = UserName.create({ value: request.name });
        if (userNameOrError.isSuccess) {
          dto = { ...dto, name: userNameOrError.getValue() };
        }
      }

      if (request.username) {
        userUserNameOrError = UserUsername.create({ value: request.username });
        if (userUserNameOrError.isSuccess) {
          const userWithUsername = await this.userService.getUserByUsername(
            userUserNameOrError.getValue(),
          );
          if (userWithUsername && !userWithUsername.id.equals(user.id)) {
            return left(
              new UpdateUserProfileUseCaseError.UsernameAlreadyTaken(),
            );
          } else {
            dto = { ...dto, username: userUserNameOrError.getValue() };
          }
        }
      }

      if (request.dateOfBirth) {
        userDOBOrError = UserDOB.create({
          value: new Date(request.dateOfBirth),
        });
        if (userDOBOrError.isSuccess) {
          dto = { ...dto, dob: userDOBOrError.getValue() };
        }
      }

      if (
        userNameOrError?.isFailure ||
        userUserNameOrError?.isFailure ||
        userDOBOrError?.isFailure
      ) {
        return left(
          new AppErrors.InvalidPayloadError(
            userNameOrError?.isFailure
              ? 'name'
              : userUserNameOrError?.isFailure
              ? 'username'
              : 'dateOfBirth',
          ),
        );
      }

      const result = await this.userService.updateUser(userIdOrError, dto);
      if (!result) {
        return left(new AppErrors.UnexpectedError('Update user failed'));
      }

      return right(Result.ok<void>());
    } catch (err) {
      return left(new AppErrors.UnexpectedError(err.toString()));
    }
  };
}
