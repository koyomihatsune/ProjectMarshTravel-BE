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

export class WrongProvider extends Result<UseCaseError> {
  constructor(providerName: string) {
    super(false, {
      message: `This account is created with ${providerName}. Please login with ${providerName} instead.`,
      code: ERROR_CODE.InvalidProvider,
    });
  }
}

export class PasswordInvalid extends Result<UseCaseError> {
  constructor() {
    super(false, {
      message: `Invalid password.`,
      code: ERROR_CODE.InvalidCredential,
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

export class PhoneNumberInvalid extends Result<UseCaseError> {
  constructor() {
    super(false, {
      message: `Phone number not formatted`,
      code: ERROR_CODE.InvalidFormat,
    });
  }
}

export class EmailAlreadyExists extends Result<UseCaseError> {
  constructor(email: string) {
    super(false, {
      code: ERROR_CODE.EmailAlreadyTaken,
      message: `Email ${email} already exists`,
    });
  }
}

export class PhoneNumberAlreadyExists extends Result<UseCaseError> {
  constructor(phoneNumber: string) {
    super(false, {
      code: ERROR_CODE.EmailAlreadyTaken,
      message: `PhoneNumber ${phoneNumber} already exists`,
    });
  }
}

export class UsernameInvalid extends Result<UseCaseError> {
  constructor() {
    super(false, {
      message: `Username not formatted`,
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
