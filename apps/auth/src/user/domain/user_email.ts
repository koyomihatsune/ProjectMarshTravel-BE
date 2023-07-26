import { COMMON_CONSTANTS } from '@app/common/constants';
import { ValueObject } from '@app/common/core/domain/value_object';
import { Result } from '@app/common/core/result';

export interface UserEmailProps {
  value: string;
}

export class UserEmail extends ValueObject<UserEmailProps> {
  get value(): string {
    return this.props.value;
  }

  private constructor(props: UserEmailProps) {
    super(props);
  }
  private static isValidEmail(email: string) {
    return COMMON_CONSTANTS.EmailRegex.test(email);
  }

  private static format(email: string): string {
    return email.trim().toLowerCase();
  }

  public static create(props: UserEmailProps): Result<UserEmail> {
    return this.isValidEmail(props.value)
      ? Result.ok<UserEmail>(new UserEmail({ value: this.format(props.value) }))
      : Result.fail<UserEmail>('Email not valid');
  }
}
