import { ERROR_CODE } from '../constants';
import { ERROR_MESSAGE } from '../constants/string.constants';
import { Result } from './result';
import { UseCaseError } from './usecase_error';
import '../others/extensions';

export class UnexpectedError extends Result<UseCaseError> {
  public constructor(err: any) {
    super(false, {
      code: ERROR_CODE.UnexpectedError,
      message: ERROR_MESSAGE.UnexpectedError,
      payload: err,
    });
  }

  public static create(err: any): UnexpectedError {
    return new UnexpectedError(err);
  }
}

export class EntityNotFoundError extends Result<UseCaseError> {
  public constructor(entityName: string, err?: any) {
    super(false, {
      code: ERROR_CODE.NotFoundError,
      message: ERROR_MESSAGE.EntityNotFound.format(entityName),
      payload: err,
    });
  }

  public static create(entityName: string, err?: any): EntityNotFoundError {
    return new EntityNotFoundError(entityName, err);
  }
}

export class InvalidPayloadError extends Result<UseCaseError> {
  public constructor(fieldName: string, err?: any) {
    super(false, {
      code: ERROR_CODE.InvalidFormat,
      message: 'Invalid payload at {0}'.format(fieldName),
      payload: err,
    });
  }

  public static create(entityName: string, err?: any): EntityNotFoundError {
    return new EntityNotFoundError(entityName, err);
  }
}

export class TooManyRequestError extends Result<UseCaseError> {
  public constructor(err?: any) {
    super(false, {
      code: ERROR_CODE.TooManyRequest,
      message: ERROR_MESSAGE.TooManyRequests,
      payload: err,
    });
  }
}

export class DateTimeNotValid extends Result<UseCaseError> {
  public constructor(err?: any, message?: string) {
    super(false, {
      code: ERROR_CODE.InvalidClassValidator,
      message: message ? message : ERROR_MESSAGE.DateTimeNotValid,
      payload: err,
    });
  }
}

export class GCSError extends Result<UseCaseError> {
  public constructor(err?: any) {
    super(false, {
      code: ERROR_CODE.ConnectStorageError,
      message: ERROR_MESSAGE.ConnectStorageError,
      payload: err,
    });
  }
}

const AppErrors = {
  UnexpectedError,
  EntityNotFoundError,
  TooManyRequestError,
  GCSError,
};

export default AppErrors;
