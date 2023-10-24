import { UseCaseError } from '@app/common/core/usecase_error';
import { Result } from '@app/common/core/result';
import { ERROR_CODE } from '@app/common/constants/';

export class DestinationNotFound extends Result<UseCaseError> {
  constructor() {
    super(false, {
      message: `place_id is invalid. Destination not found`,
      code: ERROR_CODE.DestinationNotFound,
    });
  }
}

export default {
  DestinationNotFound,
};
