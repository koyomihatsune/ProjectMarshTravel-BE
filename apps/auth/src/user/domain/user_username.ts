import { ValueObject } from '@app/common/core/domain/value_object';
import { Result } from '@app/common/core/result';

export interface UserUserNameProps {
  value: string;
}

export class UserUsername extends ValueObject<UserUserNameProps> {
  get value(): string {
    return this.props.value;
  }

  private constructor(props: UserUserNameProps) {
    super(props);
  }

  private static format(username: string): string {
    return username.trim();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private static isValidUserName(username: string): boolean {
    return true;
  }

  public static create(props: UserUserNameProps): Result<UserUsername> {
    return this.isValidUserName(props.value)
      ? Result.ok<UserUsername>(
          new UserUsername({ value: this.format(props.value) }),
        )
      : Result.fail<UserUsername>('Username not valid');
  }
}
