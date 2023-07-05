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

export default {
  InvalidCredential,
};
