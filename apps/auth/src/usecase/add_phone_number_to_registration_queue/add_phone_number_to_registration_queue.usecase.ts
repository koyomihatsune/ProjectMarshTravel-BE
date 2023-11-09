import { Injectable, Logger } from '@nestjs/common';
import { UseCase } from '@app/common/core/usecase';
import { Either, Result, left, right } from '@app/common/core/result';
import * as AppErrors from '@app/common/core/app.error';
import * as AuthUseCaseErrors from '../errors/auth.errors';
import * as LoginUseCaseErrors from '../../../user/usecase/errors/login.errors';
import { AddPhoneNumberToRegistrationQueueDTO } from './add_phone_number_to_registration_queue.dto';
import { TwilioService } from 'apps/auth/twilio/twilio.service';
import { UsersService } from 'apps/auth/user/users.service';
import { UserPhoneNumber } from 'apps/auth/user/domain/user_phonenumber';
import { AuthService } from '../../auth.service';
import { PHONE_OTP_LIMIT } from '../../constants';

type Response = Either<
  | AppErrors.EntityNotFoundError
  | AppErrors.UnexpectedError
  | AuthUseCaseErrors.OTPHardLimitNotPassed
  | AuthUseCaseErrors.OTPSoftLimitNotPassed
  | LoginUseCaseErrors.PhoneNumberAlreadyExists
  | LoginUseCaseErrors.PhoneNumberInvalid,
  Result<void>
>;
@Injectable()
export class AddPhoneNumberToRegistrationQueueUseCase
  implements UseCase<AddPhoneNumberToRegistrationQueueDTO, Promise<Response>>
{
  constructor(
    private authService: AuthService,
    private userService: UsersService,
    private twilioService: TwilioService,
  ) {}

  execute = async (
    payload: AddPhoneNumberToRegistrationQueueDTO,
  ): Promise<Response> => {
    try {
      const userPhoneNumberOrError = UserPhoneNumber.create({
        value: payload.phoneNumber,
      });

      if (userPhoneNumberOrError.isFailure) {
        return left(new LoginUseCaseErrors.PhoneNumberInvalid());
      }

      const userPhoneNumber = userPhoneNumberOrError.getValue();

      const registration = await this.authService.getRegistrationByPhoneNumber(
        userPhoneNumber.value,
      );
      if (registration) {
        if (
          new Date().getTime() - registration.lastUpdated.getTime() <
          PHONE_OTP_LIMIT.SoftLimit
        ) {
          return left(
            new AuthUseCaseErrors.OTPSoftLimitNotPassed(
              60 -
                (new Date().getTime() - registration.lastUpdated.getTime()) /
                  1000,
            ),
          );
        } else if (
          registration.tries > 3 &&
          new Date().getTime() - registration.lastUpdated.getTime() <
            PHONE_OTP_LIMIT.HardLimit
        ) {
          return left(new AuthUseCaseErrors.OTPHardLimitNotPassed());
        } else {
          await this.authService.deleteRegistration(userPhoneNumber);
        }
      }
      const sendOTPresult = await this.twilioService.sendVerifyOTP(
        userPhoneNumber.value,
      );
      if (sendOTPresult.isLeft()) {
        return left(new AppErrors.UnexpectedError(sendOTPresult.value));
      } else {
        this.authService.upsertRegistration(
          userPhoneNumberOrError.getValue(),
          registration ? registration.tries + 1 : 1,
        );
        return right(Result.ok<void>());
      }
    } catch (err) {
      Logger.log(err, err.stack);
      return left(new AppErrors.UnexpectedError(err.toString()));
    }
  };
}
