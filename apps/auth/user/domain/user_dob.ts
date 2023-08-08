import { ValueObject } from '@app/common/core/domain/value_object';
import { Result } from '@app/common/core/result';

export interface UserDOBProps {
  value: Date;
}

export class UserDOB extends ValueObject<UserDOBProps> {
  get value(): Date {
    return this.props.value;
  }

  private constructor(props: UserDOBProps) {
    super(props);
  }

  private static isValidDate(date: Date): boolean {
    // Add your date validation logic here
    // For example, you could check if it's a valid JavaScript Date object
    // or if it's within an acceptable range of dates, etc.
    // You can also use libraries like 'date-fns' or 'moment' for more advanced validations.
    return date instanceof Date && !isNaN(date.getTime());
  }

  public static create(props: UserDOBProps): Result<UserDOB> {
    return this.isValidDate(props.value)
      ? Result.ok<UserDOB>(new UserDOB({ value: props.value }))
      : Result.fail<UserDOB>('Email not valid');
  }
}
