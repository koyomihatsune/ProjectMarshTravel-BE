import { IsNotEmpty } from 'class-validator';

export class LoginGoogleTokenDTO {
  @IsNotEmpty()
  token: string;
}

export class LoginPhoneNumberDTO {
  @IsNotEmpty()
  phoneNumber: string;

  @IsNotEmpty()
  code: string;
}

export class LoginResponseDTO {
  accessToken: string;
  refreshToken: string;
  isNewAccount: boolean;
}
