import { Types } from 'mongoose';
import { User } from '../domain/user.entity';
import { UserDAO } from '../schemas/user.schema';
import { UserEmail } from '../domain/user_email';
import { UserUsername } from '../domain/user_username';
import { UniqueEntityID } from '@app/common/core/domain/unique_entity_id';
import { UserName } from '../domain/user_name';
import { UserProvider } from '../domain/user_provider';
import { UserPhoneNumber } from '../domain/user_phonenumber';
import { Result } from '@app/common/core/result';

export class UserMapper {
  // Convert User Entity to User Schema DTO
  public static async toDAO(user: User): Promise<UserDAO> {
    return {
      username: user.username?.value,
      name: user.name.value,
      provider: user.provider.value,
      email: user.email.value,
      phoneNumber: user.phoneNumber?.value,
      accessToken: user.accessToken?.value,
      refreshToken: user.refreshToken?.value,
      createdAt: user.createdAt ?? new Date(),
      _id: new Types.ObjectId(user.id.toString()),
    };
  }

  // Convert User Schema DTO to User Entity
  public static toEntity(dao: UserDAO): User | undefined {
    const userEmailOrError = UserEmail.create({ value: dao.email });
    const userNameOrError = UserName.create({ value: dao.name });
    const userProviderOrError = UserProvider.create(dao.provider);
    let userUserNameOrError;
    if (dao.username) {
      userUserNameOrError = UserUsername.create({ value: dao.username });
    }
    let userPhoneNumberOrError;
    if (dao.phoneNumber) {
      userPhoneNumberOrError = UserPhoneNumber.create({
        value: dao.phoneNumber,
      });
    }

    const payloadResult = Result.combine([
      userEmailOrError,
      userNameOrError,
      userProviderOrError,
    ]);

    if (payloadResult.isFailure) {
      return undefined;
    }

    const userIdString = dao._id.toHexString();

    const userOrError = User.create(
      {
        email: userEmailOrError.getValue(),
        username: dao.username ? userUserNameOrError.getValue() : undefined,
        name: userNameOrError.getValue(),
        provider: userProviderOrError.getValue(),
        phoneNumber: dao.phoneNumber
          ? userPhoneNumberOrError.getValue()
          : undefined,
        createdAt: dao.createdAt,
      },
      new UniqueEntityID(userIdString),
    );

    return userOrError.isSuccess ? userOrError.getValue() : undefined;
  }
}
