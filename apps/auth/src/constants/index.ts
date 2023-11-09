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
  InvalidToken: 410000,
};

export const ERROR_CODE_AUTH_COMMIT1 = {
  InvalidToken: 410000,
};

export const ERROR_CODE_AUTH_COMMIT2 = {
  InvalidToken: 410000,
};

export const JWT_CONSTANTS = {
  AccessSecretKey: 'JWT_SECRET_KEY',
  RefreshSecretKey: 'JWT_REFRESH_KEY',
};

export const OAUTH2_CONSTANTS = {
  AndroidClientID: 'OAUTH2_CLIENT_ID_ANDROID',
  iOSClientID: 'OAUTH2_CLIENT_ID_IOS',
  WebClientID: 'OAUTH2_CLIENT_ID_WEB',
};

export const TWILIO_CONSTANTS = {
  accountSid: 'TWILIO_ACCOUNTSID',
  authToken: 'TWILIO_AUTHTOKEN',
  verifySid: 'TWILIO_VERIFYSID',
};

export const PHONE_OTP_LIMIT = {
  SoftLimit: 2 * 60 * 1000, // 2 minute
  HardLimit: 24 * 60 * 60 * 1000, // 1 day
};
