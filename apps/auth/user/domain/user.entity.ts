import { AggregateRoot } from '@app/common/core/domain/aggregate_root';
import { UniqueEntityID } from '@app/common/core/domain/unique_entity_id';
import { Result } from '@app/common/core/result';
import { UserUsername } from './user_username';
import { UserName } from './user_name';
import { UserProvider } from './user_provider';
import { UserEmail } from './user_email';
import { UserPhoneNumber } from './user_phonenumber';
import { UserToken } from './user_token';
import { UserId } from './user_id';
import { UserDOB } from './user_dob';

export interface UserProps {
  username: UserUsername;
  name: UserName;
  provider: UserProvider;
  email?: UserEmail;
  dob?: UserDOB;
  avatarUrl: string;
  phoneNumber?: UserPhoneNumber;
  createdAt: Date;
  accessToken?: UserToken;
  refreshToken?: UserToken;
}

export class User extends AggregateRoot<UserProps> {
  private constructor(props: UserProps, id?: UniqueEntityID) {
    super(props, id);
  }

  get userId(): UserId {
    return UserId.create(this._id);
  }

  get username(): UserUsername {
    return this.props.username;
  }

  get name(): UserName {
    return this.props.name;
  }

  get provider(): UserProvider {
    return this.props.provider;
  }

  get dob(): UserDOB | undefined {
    return this.props.dob;
  }

  get email(): UserEmail | undefined {
    return this.props.email;
  }

  get phoneNumber(): UserPhoneNumber | undefined {
    return this.props.phoneNumber;
  }

  get avatarUrl(): string {
    return this.props.avatarUrl;
  }

  get createdAt(): Date | undefined {
    return this.props.createdAt;
  }

  get accessToken(): UserToken | undefined {
    return this.props.accessToken;
  }

  get refreshToken(): UserToken | undefined {
    return this.props.refreshToken;
  }

  // Factory method to create a new User entity
  public static create(props: UserProps, id?: UniqueEntityID): Result<User> {
    // const guardResult = Guard.againstNullOrUndefinedBulk([
    //   { argument: props.email, argumentName: 'email' },
    // ]);

    // if (guardResult.isFailure) {
    //   return Result.fail<User>(guardResult.getErrorValue());
    // }

    const user = new User(
      {
        ...props,
      },
      id,
    );

    return Result.ok<User>(user);
  }
}
