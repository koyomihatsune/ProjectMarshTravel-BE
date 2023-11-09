import { Either, Result, left, right } from '@app/common/core/result';
import * as AppErrors from '@app/common/core/app.error';
import * as AuthUseCaseErrors from '../errors/auth.errors';
import { LoginResponseDTO, LoginPhoneNumberDTO } from '../dtos/login.dto';
import { Injectable } from '@nestjs/common';
import { UseCase } from '@app/common/core/usecase';
import { AuthService } from '../../auth.service';
import { LoginWithProviderUseCase } from '../../../user/usecase/login_with_provider/login_with_provider.usecase';
import { UserProviderTypeValue } from 'apps/auth/user/domain/user_provider';
import { TwilioService } from 'apps/auth/twilio/twilio.service';
import { UserPhoneNumber } from 'apps/auth/user/domain/user_phonenumber';

type Response = Either<
  AuthUseCaseErrors.InvalidCredential | AppErrors.UnexpectedError,
  Result<LoginResponseDTO>
>;

@Injectable()
export class LoginPhoneNumberUseCase
  implements UseCase<LoginPhoneNumberDTO, Promise<Response>>
{
  constructor(
    private authService: AuthService,
    private twilioService: TwilioService,
    private loginWithProviderUseCase: LoginWithProviderUseCase,
  ) {}

  execute = async (payload: LoginPhoneNumberDTO): Promise<Response> => {
    const verifiedPhoneNumber: Either<Error, Result<boolean>> =
      // right(
      //   Result.ok(true),
      // );
      await this.twilioService.verifyCode(payload.phoneNumber, payload.code);

    if (verifiedPhoneNumber.isLeft()) {
      return left(new AuthUseCaseErrors.InvalidCredential());
    }
    if (verifiedPhoneNumber.isRight()) {
      this.authService.deleteRegistration(
        UserPhoneNumber.create({ value: payload.phoneNumber }).getValue(),
      );
    }

    const userLoginResult = await this.loginWithProviderUseCase.execute({
      emailOrPhoneNumber: payload.phoneNumber,
      provider: UserProviderTypeValue.PHONE_NUMBER,
    });

    if (userLoginResult.isLeft()) {
      return left(userLoginResult.value);
    }
    return right(userLoginResult.value);
  };
}
