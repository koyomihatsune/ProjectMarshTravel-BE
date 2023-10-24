import { ERROR_CODE } from '@app/common/constants';
import { Result } from '@app/common/core/result';
import { UseCaseError } from '@app/common/core/usecase_error';

export class AdmCurrentStateIsNotFollowed extends Result<UseCaseError> {
  constructor() {
    super(false, {
      message: `Administrative current state is not followed`,
      code: ERROR_CODE.UnmatchedExpectedData,
    });
  }
}

export class AdmCurrentStateIsFollowed extends Result<UseCaseError> {
  constructor() {
    super(false, {
      message: `Administrative current state is followed`,
      code: ERROR_CODE.UnmatchedExpectedData,
    });
  }
}
