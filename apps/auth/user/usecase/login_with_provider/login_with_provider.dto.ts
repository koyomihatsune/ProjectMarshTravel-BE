import { DecodedIdToken } from 'firebase-admin/lib/auth/token-verifier';

export interface LoginWithProviderDTO {
  email: string;
  provider: string;
  googleDecodedToken?: DecodedIdToken;
}
