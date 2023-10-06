import { UniqueEntityID } from '@app/common/core/domain/unique_entity_id';
import { Either, Result, left, right } from '@app/common/core/result';
import { UseCase } from '@app/common/core/usecase';
import { Injectable, Logger } from '@nestjs/common';
import { UserId } from '../../domain/user_id';
import { UsersService } from '../../users.service';
import { UpdateUserAvatarDTO } from './update_avatar.dto';
import * as AppErrors from '@app/common/core/app.error';

type Response = Either<
  | AppErrors.EntityNotFoundError
  | AppErrors.UnexpectedError
  | AppErrors.GCSError,
  Result<string>
>;

type UpdateUserAvatarDTOWithID = {
  userId: string;
  request: UpdateUserAvatarDTO;
};

@Injectable()
export class UpdateUserAvatarUseCase
  implements UseCase<UpdateUserAvatarDTOWithID, Response>
{
  constructor(private readonly userService: UsersService) {}

  execute = async (payload: UpdateUserAvatarDTOWithID): Promise<Response> => {
    try {
      const { userId, request } = payload;

      const userIdOrError = UserId.create(new UniqueEntityID(userId));

      const user = await this.userService.getUser(userIdOrError);
      if (user === undefined) {
        return left(new AppErrors.EntityNotFoundError('User'));
      }

      // const role = await this.roleService.getRoleById(user.roleId);

      // if (role === undefined) {
      //   return left(new AppErrors.EntityNotFoundError('User With Role'));
      // }

      const handleUploadImage = await this.userService.updateUserAvatar(
        user.userId,
        {
          avatar: request.avatar,
        },
      );
      if (handleUploadImage.isLeft()) {
        return left(handleUploadImage.value);
      }

      return right(Result.ok<string>(handleUploadImage.value));
    } catch (err) {
      Logger.error(err, err.stack);
      return left(new AppErrors.UnexpectedError(err.message));
    }
  };
}
