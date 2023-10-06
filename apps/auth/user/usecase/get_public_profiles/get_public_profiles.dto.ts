import { IsNotEmpty } from 'class-validator';

export class GetPublicUserProfilesDTO {
  @IsNotEmpty()
  userIds: string[] | string;
}

export class SinglePublicUserProfileResponseDTO {
  id: string;
  name: string;
  username: string;
  avatar: string;
}

export class MultiplePublicUserProfileResponseDTO {
  users: SinglePublicUserProfileResponseDTO[];
}
