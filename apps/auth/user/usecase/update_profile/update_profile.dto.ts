import { UserDOB } from '../../domain/user_dob';
import { UserName } from '../../domain/user_name';
import { UserUsername } from '../../domain/user_username';

export class UpdateUserProfileDTO {
  username?: string;
  name?: string;
  dob?: string;
}

export class UpdateUserProfileEntityDTO {
  username?: UserUsername;
  name?: UserName;
  dob?: UserDOB;
}
