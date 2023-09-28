import { UniqueEntityID } from '@app/common/core/domain/unique_entity_id';
import { Either, Result, left, right } from '@app/common/core/result';
import { UseCase } from '@app/common/core/usecase';
import { Injectable, NotFoundException } from '@nestjs/common';
import { UserId } from '../../domain/user_id';
import { UsersService } from '../../users.service';
import { GetUserProfileDTO, UserProfileResponseDTO } from './get_profile.dto';
import * as AppErrors from '@app/common/core/app.error';

type Response = Either<
  AppErrors.EntityNotFoundError | AppErrors.UnexpectedError,
  Result<UserProfileResponseDTO> | Result<void>
>;
@Injectable()
export class GetUserProfileUseCase
  implements UseCase<GetUserProfileDTO, Promise<Response>>
{
  constructor(private readonly userService: UsersService) {}

  execute = async (request: GetUserProfileDTO): Promise<Response> => {
    try {
      const userIdOrError = UserId.create(new UniqueEntityID(request.userId));
      const user = await this.userService.getUser(userIdOrError);

      const response: UserProfileResponseDTO = {
        id: user.userId.getValue().toString(),
        name: user.name.value,
        email: user.email.value,
        avatar: user.avatarUrl,
        provider: user.provider.value,
        username: user.username ? user.username.value : '',
        phoneNumber: user.phoneNumber ? user.phoneNumber.value : '',
        dateOfBirth: user.dob ? user.dob.value.toISOString() : '',
      };

      return right(Result.ok<UserProfileResponseDTO>(response));
    } catch (err) {
      if (err instanceof NotFoundException) {
        return left(new AppErrors.EntityNotFoundError('User'));
      }
      return left(new AppErrors.UnexpectedError(err));
    }
  };
}
