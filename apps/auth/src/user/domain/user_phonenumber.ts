import { ValueObject } from '@app/common/core/domain/value_object';
import { Result } from '@app/common/core/result';

export interface UserPhoneNumberProps {
  value: string;
}

export class UserPhoneNumber extends ValueObject<UserPhoneNumberProps> {
  get value(): string {
    return this.props.value;
  }

  private constructor(props: UserPhoneNumberProps) {
    super(props);
  }

  private static format(phonenumber: string): string {
    return phonenumber.trim();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private static isValidPhoneNumber(phonenumber: string): boolean {
    return true;
  }

  public static create(props: UserPhoneNumberProps): Result<UserPhoneNumber> {
    return this.isValidPhoneNumber(props.value)
      ? Result.ok<UserPhoneNumber>(
          new UserPhoneNumber({ value: this.format(props.value) }),
        )
      : Result.fail<UserPhoneNumber>('Username not valid');
  }
}
