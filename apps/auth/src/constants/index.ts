import * as dotenv from 'dotenv';
dotenv.config();

// Error code will have abcccc format
// In which, a = [4, 5] with 4 is client error and 5 is server error
// b will be domain of error,
// for example b = 0 for common domain (like errors for guards, or too many request), b = 1 for auth domain, b = 2 for user domain, b = 3 for storage domain, b = 4 for payment
// cccc demonstrate the order number of error or using HTTP code for better meaning (404 for not found, 429 for too many request).
// For example an A error happens on auth domain because of client will have value 410000,
// Next error happens on auth domain because of client will have value 410001

export const ERROR_CODE_AUTH_ONLY = {
  UnexpectedError: 500000,
  NotFoundError: 500404,
  TooManyRequest: 400429,
  InvalidClassValidator: 400001,
  InvalidToken: 410000,
  InvalidCredential: 420000,
  VerifiedOnly: 420003,
  UnverifiedOnly: 420004,
  EmailSendLimit: 420005,
  EmailAlreadyTaken: 420000,
  UnmatchedExpectedData: 420002,
  InvalidFormat: 420003,
  CustomerIdExist: 440000,
  ConnectStorageError: 530000,
};
