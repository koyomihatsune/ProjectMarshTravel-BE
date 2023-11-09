import { Either, Result, left } from '@app/common/core/result';
import * as LoginUseCaseErrors from '../errors/auth.errors';
import { LoginResponseDTO, LoginGoogleTokenDTO } from '../dtos/login.dto';
import { Injectable } from '@nestjs/common';
import { UseCase } from '@app/common/core/usecase';
import { AuthService } from '../../auth.service';
import { LoginWithProviderUseCase } from '../../../user/usecase/login_with_provider/login_with_provider.usecase';
import { UserProviderTypeValue } from 'apps/auth/user/domain/user_provider';

type Response = Either<
  LoginUseCaseErrors.InvalidCredential,
  Result<LoginResponseDTO>
>;

@Injectable()
export class LoginUseCase
  implements UseCase<LoginGoogleTokenDTO, Promise<Response>>
{
  constructor(
    private authService: AuthService,
    private loginWithProviderUseCase: LoginWithProviderUseCase,
  ) {}

  execute = async (payload: LoginGoogleTokenDTO): Promise<Response> => {
    const decodedToken = await this.authService.firebaseAuthenticateWithToken({
      token: payload.token,
    });

    if (decodedToken === null) {
      return left(new LoginUseCaseErrors.InvalidCredential());
    }

    const userLoginResult = await this.loginWithProviderUseCase.execute({
      emailOrPhoneNumber: decodedToken.getPayload().email,
      provider: UserProviderTypeValue.GOOGLE,
      googleDecodedToken: decodedToken,
    });

    if (userLoginResult.isLeft()) {
      return userLoginResult;
    }
    return userLoginResult;
  };
}
