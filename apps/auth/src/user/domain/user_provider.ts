import { ValueObject } from '@app/common/core/domain/value_object';
import { Guard } from '@app/common/core/guard';
import { Result } from '@app/common/core/result';

export const UserProviderTypeValue = {
  GOOGLE: 'google.com',
} as const;

export type UserProviderType =
  (typeof UserProviderTypeValue)[keyof typeof UserProviderTypeValue];

interface UserProviderProps {
  value: UserProviderType;
}

export class UserProvider extends ValueObject<UserProviderProps> {
  get value(): UserProviderType {
    return this.props.value;
  }

  public static create(provider: string): Result<UserProvider> {
    const propsResult = Guard.isOneOf(
      provider,
      [UserProviderTypeValue.GOOGLE],
      'provider',
    );

    if (propsResult.isFailure) {
      return Result.fail<UserProvider>(propsResult.getErrorValue());
    }

    return Result.ok<UserProvider>(
      new UserProvider({ value: provider as UserProviderType }), // Because we do a guard above, so we safe to cast here
    );
  }
}
