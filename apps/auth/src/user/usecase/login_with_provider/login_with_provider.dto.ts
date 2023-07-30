import { LoginTicket } from 'google-auth-library';

export interface LoginWithProviderDTO {
  email: string;
  provider: string;
  googleDecodedToken?: LoginTicket;
}
