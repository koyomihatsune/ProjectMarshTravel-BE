import { UseCaseError } from '@app/common/core/usecase_error';
import { Result } from '@app/common/core/result';
import { ERROR_CODE } from '@app/common/constants/';

export class InvalidCredential extends Result<UseCaseError> {
  constructor() {
    super(false, {
      message: `Invalid Credential`,
      code: ERROR_CODE.InvalidCredential,
    });
  }
}

export class OTPSoftLimitNotPassed extends Result<UseCaseError> {
  constructor(seconds: number) {
    super(false, {
      message: `Please retry after ${seconds} seconds.`,
      code: ERROR_CODE.InvalidFormat,
    });
  }
}

export class OTPHardLimitNotPassed extends Result<UseCaseError> {
  constructor() {
    super(false, {
      message: `Too many request to OTP server. Please retry after 1 day.`,
      code: ERROR_CODE.TooManyRequest,
    });
  }
}

export default {
  InvalidCredential,
};
