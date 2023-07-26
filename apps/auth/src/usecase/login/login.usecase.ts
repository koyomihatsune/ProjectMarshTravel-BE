import { Either, Result, left, right } from '@app/common/core/result';
import * as LoginUseCaseErrors from './login.errors';
import { LoginResponseDTO, LoginDTO } from './login.dto';
import { Injectable } from '@nestjs/common';
import { UseCase } from '@app/common/core/usecase';
import { AuthService } from '../../auth.service';
import { UsersService } from '../../user/users.service';
import AppErrors from '@app/common/core/app.error';
import { LoginWithProviderUseCase } from '../../user/usecase/login_with_provider/login_with_provider.usecase';

type Response = Either<
  LoginUseCaseErrors.InvalidCredential,
  Result<LoginResponseDTO>
>;

@Injectable()
export class LoginUseCase implements UseCase<LoginDTO, Promise<Response>> {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
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
      email: decodedToken.email,
      provider: 'firebase_google',
      googleDecodedToken: decodedToken,
    });

    if (userLoginResult === null) {
      return left(new AppErrors.UnexpectedError(''));
    }
    return right(Result.ok<LoginResponseDTO>(userLoginResult));
  };
}
