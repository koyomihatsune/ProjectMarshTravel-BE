import { IsNotEmpty } from 'class-validator';

export class GetUserProfileDTO {
  @IsNotEmpty()
  userId: string;
}

export class UserProfileResponseDTO {
  name: string;
  email: string;
  avatar: string;
  provider: string;
  username: string;
  phoneNumber: string;
  dob: string;
}
