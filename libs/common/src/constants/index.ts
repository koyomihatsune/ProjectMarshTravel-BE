import * as dotenv from 'dotenv';
dotenv.config();
export const COMMON_CONSTANTS = {
  EmailRegex:
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
  UrlRegex:
    /(?:https?):\/\/(\w+:?\w*)?(\S+)(:\d+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/,
};

// Error code will have abcccc format
// In which, a = [4, 5] with 4 is client error and 5 is server error
// b will be domain of error,
// for example b = 0 for common domain (like errors for guards, or too many request), b = 1 for auth domain, b = 2 for user domain, b = 3 for storage domain, b = 5 for comment
// cccc demonstrate the order number of error or using HTTP code for better meaning (404 for not found, 429 for too many request).
// For example an A error happens on auth domain because of client will have value 410000,
// Next error happens on auth domain because of client will have value 410001
export const ERROR_CODE = {
  UnexpectedError: 500000,
  InvalidProvider: 500409,
  NotFoundError: 500404,
  TooManyRequest: 400429,
  InvalidClassValidator: 400001,
  InvalidToken: 410000,
  InvalidCredential: 420000,
  EmailAlreadyTaken: 420000,
  EntityNotBelongToUser: 420001,
  UsernameAlreadyTaken: 420009,
  UnmatchedExpectedData: 420002,
  InvalidFormat: 420003,
  InvalidLength: 420004,
  CustomerIdExist: 440000,
  ConnectStorageError: 530000,
  DestinationNotFound: 510404,
  AlreadyChild: 420005,
};

export const STORAGE_PATH = {
  //user
  UserAvatar: 'staging/user/avatar',
  UserReview: 'staging/user/review',
  UserComment: 'staging/user/comment',
};

export const SORT_CONST = {
  DATE_NEWEST: 'DATE_NEWEST',
  DATE_OLDEST: 'DATE_OLDEST',
  RATING_HIGHEST: 'RATING_HIGHEST',
  RATING_LOWEST: 'RATING_LOWEST',
  LIKE_HIGHEST: 'LIKE_HIGHEST',
  LIKE_LOWEST: 'LIKE_LOWEST',
};
