import { ValueObject } from '@app/common/core/domain/value_object';
import { Result } from '@app/common/core/result';

export interface UserNameProps {
  value: string;
}

export class UserName extends ValueObject<UserNameProps> {
  get value(): string {
    return this.props.value;
  }

  private constructor(props: UserNameProps) {
    super(props);
  }

  private static format(email: string): string {
    return email.trim();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private static isValidUserName(username: string): boolean {
    return true;
  }

  public static create(props: UserNameProps): Result<UserName> {
    return this.isValidUserName(props.value)
      ? Result.ok<UserName>(new UserName({ value: this.format(props.value) }))
      : Result.fail<UserName>('Name not valid');
  }
}
