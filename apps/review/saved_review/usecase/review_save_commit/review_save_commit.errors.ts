import { ERROR_CODE } from '@app/common/constants';
import { Result } from '@app/common/core/result';
import { UseCaseError } from '@app/common/core/usecase_error';

export class ReviewCurrentStateIsNotSaved extends Result<UseCaseError> {
  constructor() {
    super(false, {
      message: `Review current state is not saved`,
      code: ERROR_CODE.UnmatchedExpectedData,
    });
  }
}

export class ReviewCurrentStateIsSaved extends Result<UseCaseError> {
  constructor() {
    super(false, {
      message: `Review current state is saved`,
      code: ERROR_CODE.UnmatchedExpectedData,
    });
  }
}
