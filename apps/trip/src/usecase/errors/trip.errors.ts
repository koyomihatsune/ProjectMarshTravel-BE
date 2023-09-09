import { UseCaseError } from '@app/common/core/usecase_error';
import { Result } from '@app/common/core/result';
import { ERROR_CODE } from '@app/common/constants/';

export class TripDoesNotBelongToUser extends Result<UseCaseError> {
  constructor() {
    super(false, {
      message: `TripDoesNotBelongToUser`,
      code: ERROR_CODE.EntityNotBelongToUser,
    });
  }
}

export class TripDayPositionInvalidError extends Result<UseCaseError> {
  constructor(maxPosition: string) {
    super(false, {
      message: `Invalid position. Max is: ${maxPosition}`,
      code: ERROR_CODE.InvalidLength,
    });
  }
}

export class TripDayPositionSequenceInvalidError extends Result<UseCaseError> {
  constructor() {
    super(false, {
      message: `Invalid position sequence. Each number should only appear once. Each number should be in range [0, maxPosition]. Each number should be in increasing sequence from 0.`,
      code: ERROR_CODE.InvalidLength,
    });
  }
}

export default {
  TripDoesNotBelongToUser,
  TripDayPositionInvalidError,
};
