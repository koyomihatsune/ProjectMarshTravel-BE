import { ERROR_CODE } from '@app/common/constants';
import { Result } from '@app/common/core/result';
import { UseCaseError } from '@app/common/core/usecase_error';

export class InvalidPayload extends Result<UseCaseError> {
  constructor() {
    super(false, {
      message: `Invalid payload`,
      code: ERROR_CODE.InvalidFormat,
    });
  }
}

export class UsernameAlreadyTaken extends Result<UseCaseError> {
  constructor() {
    super(false, {
      message: `Username Already Taken`,
      code: ERROR_CODE.UsernameAlreadyTaken,
    });
  }
}
