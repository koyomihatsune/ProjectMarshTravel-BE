import { Either, Result, left } from '@app/common/core/result';
import * as LoginUseCaseErrors from './login.errors';
import { LoginResponseDTO, LoginDTO } from './login.dto';
import { Injectable } from '@nestjs/common';
import { UseCase } from '@app/common/core/usecase';
import { AuthService } from '../../auth.service';
import { LoginWithProviderUseCase } from '../../../user/usecase/login_with_provider/login_with_provider.usecase';

type Response = Either<
  LoginUseCaseErrors.InvalidCredential,
  Result<LoginResponseDTO>
>;

@Injectable()
export class LoginUseCase implements UseCase<LoginDTO, Promise<Response>> {
  constructor(
    private authService: AuthService,
    private loginWithProviderUseCase: LoginWithProviderUseCase,
  ) {}

  execute = async (payload: LoginDTO): Promise<Response> => {
    const decodedToken = await this.authService.firebaseAuthenticateWithToken({
      token: payload.token,
    });

    if (decodedToken === null) {
      return left(new LoginUseCaseErrors.InvalidCredential());
    }

    const userLoginResult = await this.loginWithProviderUseCase.execute({
      email: decodedToken.getPayload().email,
      provider: 'firebase_google',
      googleDecodedToken: decodedToken,
    });

    if (userLoginResult.isLeft()) {
      return userLoginResult;
    }
    return userLoginResult;
  };
}
