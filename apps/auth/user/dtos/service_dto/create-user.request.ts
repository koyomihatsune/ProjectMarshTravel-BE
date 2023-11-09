import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { UserProvider } from '../../domain/user_provider';
import { UserEmail } from '../../domain/user_email';
import { UserName } from '../../domain/user_name';
import { UserUsername } from '../../domain/user_username';
import { UserPhoneNumber } from '../../domain/user_phonenumber';

export class CreateUserRequest {
  @IsEmail()
  email?: UserEmail;

  phoneNumber?: UserPhoneNumber;

  @IsNotEmpty()
  provider: UserProvider;

  @IsNotEmpty()
  @IsString()
  name: UserName;

  @IsNotEmpty()
  @IsString()
  username: UserUsername;
}
