import { Injectable } from '@nestjs/common';
import { UseCase } from '@app/common/core/usecase';
import { LoginWithProviderDTO } from './login_with_provider.dto';
import { AuthService } from 'apps/auth/src/auth.service';
import { UsersService } from '../../users.service';
import { UserEmail } from '../../domain/user_email';
import { User } from '../../domain/user.entity';
import { CreateUserRequest } from '../../service_dto/create-user.request';
import { LoginResponseDTO } from 'apps/auth/src/usecase/login/login.dto';
import { Either, Result, left, right } from '@app/common/core/result';
import * as LoginWithProviderUseCaseErrors from './login.errors';
import { UserProvider } from '../../domain/user_provider';
import { UserName } from '../../domain/user_name';
import * as AppErrors from '@app/common/core/app.error';
import { UserUsername } from '../../domain/user_username';
import { TokenPayload } from 'google-auth-library';

type Response = Either<
  | AppErrors.EntityNotFoundError
  | AppErrors.UnexpectedError
  | LoginWithProviderUseCaseErrors.UserFailedToCreate
  | LoginWithProviderUseCaseErrors.EmailInvalid
  | LoginWithProviderUseCaseErrors.ProviderInvalid
  | LoginWithProviderUseCaseErrors.UsernameInvalid
  | LoginWithProviderUseCaseErrors.NameInvalid,
  Result<LoginResponseDTO>
>;
@Injectable()
export class LoginWithProviderUseCase
  implements UseCase<LoginWithProviderDTO, Promise<Response>>
{
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  execute = async (payload: LoginWithProviderDTO): Promise<Response> => {
    try {
      const userEmailOrError = UserEmail.create({ value: payload.email });
      if (userEmailOrError.isFailure) {
        throw new Error('Email không hợp lệ');
      }
      // Kiểm tra email có tồn tại hay không, nếu không thì tạo user mới luôn, rồi tạo JWT.
      let user: User = await this.usersService.getUserByEmail(
        userEmailOrError.getValue(),
      );
      let initUser = false;

      // User chưa tồn tại, tạo user mới
      if (!user) {
        let decodedToken: TokenPayload | null;
        if (payload.provider === 'firebase_google') {
          decodedToken = payload.googleDecodedToken.getPayload();

          const userEmailOrError = UserEmail.create({
            value: decodedToken.email,
          });
          if (userEmailOrError.isFailure) {
            return left(new LoginWithProviderUseCaseErrors.EmailInvalid());
          }

          const userProviderOrError = UserProvider.create('google.com');
          if (userProviderOrError.isFailure) {
            return left(new LoginWithProviderUseCaseErrors.ProviderInvalid());
          }
          const userUsernameOrError = UserUsername.create({
            value: decodedToken.sub.toString(),
          });
          if (userUsernameOrError.isFailure) {
            return left(new LoginWithProviderUseCaseErrors.UsernameInvalid());
          }
          const userNameOrError = UserName.create({ value: decodedToken.name });
          if (userNameOrError.isFailure) {
            return left(new LoginWithProviderUseCaseErrors.NameInvalid());
          }

          const createUserRequestDTO: CreateUserRequest = {
            email: userEmailOrError.getValue(),
            provider: userProviderOrError.getValue(),
            name: userNameOrError.getValue(),
            username: userUsernameOrError.getValue(),
          };
          user = await this.usersService.createUser(createUserRequestDTO);
          initUser = true;
        }
      }

      if (!user) {
        return left(new LoginWithProviderUseCaseErrors.UserFailedToCreate());
      }

      const token = await this.authService.generateAccessToken(user);
      // Trong trường hợp token không dùng được
      // const token = {
      //   accessToken: 'a',
      //   refreshToken: 'b',
      // };

      await this.usersService.updateUserToken(user.userId, {
        accessToken: token.accessToken,
        refreshToken: token.refreshToken,
      });

      return right(
        Result.ok<LoginResponseDTO>({
          accessToken: token.accessToken,
          refreshToken: token.refreshToken,
          isNewAccount: initUser,
        }),
      );
    } catch (err) {
      return left(new AppErrors.UnexpectedError(err.toString()));
    }
  };
}
