import { LoginTicket } from 'google-auth-library';

export interface LoginWithProviderDTO {
  emailOrPhoneNumber: string;
  provider: string;
  googleDecodedToken?: LoginTicket;
}
