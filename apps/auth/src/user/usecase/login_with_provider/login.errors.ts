import { UseCaseError } from '@app/common/core/usecase_error';
import { Result } from '@app/common/core/result';
import { ERROR_CODE } from '@app/common/constants/';

export class UserFailedToCreate extends Result<UseCaseError> {
  constructor() {
    super(false, {
      message: `User failed to create`,
      code: ERROR_CODE.UnexpectedError,
    });
  }
}

export class EmailInvalid extends Result<UseCaseError> {
  constructor() {
    super(false, {
      message: `Email not formatted`,
      code: ERROR_CODE.InvalidFormat,
    });
  }
}

export class UsernameInvalid extends Result<UseCaseError> {
  constructor() {
    super(false, {
      message: `Email not formatted`,
      code: ERROR_CODE.InvalidFormat,
    });
  }
}

export class ProviderInvalid extends Result<UseCaseError> {
  constructor() {
    super(false, {
      message: `Provider not existed`,
      code: ERROR_CODE.UnexpectedError,
    });
  }
}

export class NameInvalid extends Result<UseCaseError> {
  constructor() {
    super(false, {
      message: `Name not formatted`,
      code: ERROR_CODE.InvalidFormat,
    });
  }
}

export default {
  UserFailedToCreate,
};
