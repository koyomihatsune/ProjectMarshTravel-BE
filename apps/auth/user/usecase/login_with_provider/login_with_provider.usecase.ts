import { Injectable, Logger } from '@nestjs/common';
import { UseCase } from '@app/common/core/usecase';
import { LoginWithProviderDTO } from './login_with_provider.dto';
import { AuthService } from 'apps/auth/src/auth.service';
import { UsersService } from '../../users.service';
import { UserEmail } from '../../domain/user_email';
import { CreateUserRequest } from '../../dtos/service_dto/create-user.request';
import { LoginResponseDTO } from 'apps/auth/src/usecase/dtos/login.dto';
import { Either, Result, left, right } from '@app/common/core/result';
import * as LoginWithProviderUseCaseErrors from '../errors/login.errors';
import {
  UserProvider,
  UserProviderTypeValue,
} from '../../domain/user_provider';
import { UserName } from '../../domain/user_name';
import * as AppErrors from '@app/common/core/app.error';
import { UserUsername } from '../../domain/user_username';
import { TokenPayload } from 'google-auth-library';
import { UserPhoneNumber } from '../../domain/user_phonenumber';
import { v1 as uuidv1 } from 'uuid';

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
      let foundUser = undefined;
      let initialUserEmailOrError = undefined;
      let initialUserPhoneNumberOrError = undefined;
      if (payload.provider !== UserProviderTypeValue.PHONE_NUMBER) {
        initialUserEmailOrError = UserEmail.create({
          value: payload.emailOrPhoneNumber,
        });
        if (initialUserEmailOrError.isFailure) {
          return left(new LoginWithProviderUseCaseErrors.EmailInvalid());
        }
        foundUser = await this.usersService.getUserByEmail(
          initialUserEmailOrError.getValue(),
        );
        if (foundUser?.provider?.value === UserProviderTypeValue.PHONE_NUMBER) {
          return left(new LoginWithProviderUseCaseErrors.ProviderInvalid());
        }
      } else {
        initialUserPhoneNumberOrError = UserPhoneNumber.create({
          value: payload.emailOrPhoneNumber,
        });
        if (initialUserPhoneNumberOrError.isFailure) {
          throw new LoginWithProviderUseCaseErrors.PhoneNumberInvalid();
        }
        foundUser = await this.usersService.getUserByPhoneNumber(
          initialUserPhoneNumberOrError.getValue(),
        );

        if (foundUser) {
          if (foundUser.provider.value !== UserProviderTypeValue.PHONE_NUMBER) {
            return left(new LoginWithProviderUseCaseErrors.ProviderInvalid());
          }
        }
      }

      let initUser = false;

      // User chưa tồn tại, tạo user mới
      if (!foundUser) {
        let decodedToken: TokenPayload | null;
        let userEmailOrError: Result<UserEmail>;
        let userProviderOrError: Result<UserProvider>;
        let userPhoneNumberOrError: Result<UserPhoneNumber>;
        let userUsernameOrError: Result<UserUsername>;
        let userNameOrError: Result<UserName>;
        if (payload.provider === UserProviderTypeValue.GOOGLE) {
          decodedToken = payload.googleDecodedToken.getPayload();
          userProviderOrError = UserProvider.create(
            UserProviderTypeValue.GOOGLE,
          );
          userEmailOrError = UserEmail.create({
            value: decodedToken.email,
          });
          if (userEmailOrError.isFailure) {
            return left(new LoginWithProviderUseCaseErrors.EmailInvalid());
          }
          userNameOrError = UserName.create({ value: decodedToken.given_name });
          if (userNameOrError.isFailure) {
            UserName.create({ value: 'Untitled' });
          }
        } else if (payload.provider === UserProviderTypeValue.PHONE_NUMBER) {
          userProviderOrError = UserProvider.create(
            UserProviderTypeValue.PHONE_NUMBER,
          );
          if (userProviderOrError.isFailure) {
            return left(new LoginWithProviderUseCaseErrors.ProviderInvalid());
          }
          userPhoneNumberOrError = UserPhoneNumber.create({
            value: payload.emailOrPhoneNumber,
          });
          if (userPhoneNumberOrError.isFailure) {
            return left(
              new LoginWithProviderUseCaseErrors.PhoneNumberInvalid(),
            );
          }
          userNameOrError = UserName.create({ value: 'Untitled' });
        }

        // eslint-disable-next-line prefer-const
        userUsernameOrError = UserUsername.create({
          value: 'id' + uuidv1().slice(0, 8),
        });
        if (userUsernameOrError.isFailure) {
          return left(new LoginWithProviderUseCaseErrors.UsernameInvalid());
        }

        const createUserRequestDTO: CreateUserRequest =
          payload.provider !== UserProviderTypeValue.PHONE_NUMBER
            ? {
                email: userEmailOrError.getValue(),
                provider: userProviderOrError.getValue(),
                name: userNameOrError.getValue(),
                username: userUsernameOrError.getValue(),
              }
            : {
                phoneNumber: userPhoneNumberOrError.getValue(),
                provider: userProviderOrError.getValue(),
                name: userNameOrError.getValue(),
                username: userUsernameOrError.getValue(),
              };
        foundUser = await this.usersService.createUser(createUserRequestDTO);
        initUser = true;
      }

      if (!foundUser) {
        return left(new LoginWithProviderUseCaseErrors.UserFailedToCreate());
      }

      const token = await this.authService.generateAccessToken(foundUser);
      // Trong trường hợp token không dùng được
      // const token = {
      //   accessToken: 'a',
      //   refreshToken: 'b',
      // };

      await this.usersService.updateUserToken(foundUser.userId, {
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
      Logger.log(err, err.stack);
      return left(new AppErrors.UnexpectedError(err.toString()));
    }
  };
}
