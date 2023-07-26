import { ValueObject } from '@app/common/core/domain/value_object';
import { Guard } from '@app/common/core/guard';
import { Result } from '@app/common/core/result';

export interface UserTokenProps {
  value: string;
}

export class UserToken extends ValueObject<UserTokenProps> {
  get value(): string {
    return this.props.value;
  }

  private constructor(props: UserTokenProps) {
    super(props);
  }

  public static create(props: UserTokenProps): Result<UserToken> {
    const propsResult = Guard.againstNullOrUndefined(props.value, 'token');

    if (propsResult.isFailure) {
      return Result.fail<UserToken>(propsResult.getErrorValue());
    }

    return Result.ok<UserToken>(new UserToken({ value: props.value }));
  }
}
