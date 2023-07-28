export const API_MESSAGE = {
  TokenRefreshSuccess: 'Token refreshed success',
  UnknownErrorHappen: 'Unknown error happens',
  InvalidToken: 'Invalid token',
  InvalidRequestField: 'You have submit an(some) invalid field(s)',
};

export const ERROR_MESSAGE = {
  UnexpectedError: `An unexpected error occurred.`,
  SomethingsWentWrong: 'Somethings went wrong.',
  TokenGenerationError: 'Token generation error',
  EntityNotFound: 'Entity {0} not found',
  TooManyRequests: 'Too many requests',
  DateTimeNotValid: 'Datetime is not valid',
};

export const STR_COMMON = {
  Success: 'Success',
  Fail: 'Fail',
  UserUpdated: 'User has been updated',
};

export const GUARD_MESSAGE = {
  GreaterThan: (actualValue: number, minValue: number) =>
    `Number given {${actualValue}} is not greater than {${minValue}}`,
  GreaterThanOrEqualTo: (actualValue: number, minValue: number) =>
    `Number given {${actualValue}} is not greater than or equal to {${minValue}}`,
  AgainstAtLeast: (numChars: number) =>
    `Text is not at least ${numChars} chars.`,
  AgainstAtMost: (numChars: number) =>
    `Text is greater than ${numChars} chars.`,
  AgainstNullOrUndefined: (argumentName: string) =>
    `${argumentName} is null or undefined`,
  AgainstNullOrUndefinedOrEmpty: (argumentName: string) =>
    `${argumentName} is null or undefined or Empty`,
  IsOneOf: (argumentName: string, validValues: number[], value: number) =>
    `${argumentName} isn't oneOf the correct types in ${JSON.stringify(
      validValues,
    )}. Got "${value}".`,
  InRange: (argumentName: string, min: number, max: number) =>
    `${argumentName} is not within range ${min} to ${max}.`,
  AllInRange: (argumentName: string) =>
    `${argumentName} is not within the range.`,
};
