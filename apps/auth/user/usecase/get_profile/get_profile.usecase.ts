import { UniqueEntityID } from '@app/common/core/domain/unique_entity_id';
import { Either, Result, left, right } from '@app/common/core/result';
import { UseCase } from '@app/common/core/usecase';
import { Injectable } from '@nestjs/common';
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

      if (user === undefined) {
        return left(new AppErrors.EntityNotFoundError('User'));
      }

      const response: UserProfileResponseDTO = {
        name: user.name.value,
        email: user.email.value,
        avatar:
          'https://pjsekai.sega.jp/assets/images/special/download/sns-icon/unit01/icon_01_unit01_miku.png',
        provider: user.provider.value,
        username: user.username ? user.username.value : '',
        phoneNumber: user.phoneNumber ? user.phoneNumber.value : '',
        dob: user.dob ? user.dob.value.toISOString() : '',
      };

      return right(Result.ok<UserProfileResponseDTO>(response));
    } catch (err) {
      return left(new AppErrors.UnexpectedError(err.toString()));
    }
  };
}
