import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { UserProvider } from '../../domain/user_provider';
import { UserEmail } from '../../domain/user_email';
import { UserName } from '../../domain/user_name';
import { UserUsername } from '../../domain/user_username';

export class CreateUserRequest {
  @IsNotEmpty()
  @IsEmail()
  email: UserEmail;

  @IsNotEmpty()
  @IsString()
  provider: UserProvider;

  @IsNotEmpty()
  @IsString()
  name: UserName;

  @IsNotEmpty()
  @IsString()
  username: UserUsername;
}
