import { Either, Result, left } from '@app/common/core/result';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as twilio from 'twilio';
import { right } from '../../../libs/common/src/core/result';
import { TWILIO_CONSTANTS } from '../src/constants';

@Injectable()
export class TwilioService {
  constructor(private configService: ConfigService) {}

  async sendVerifyOTP(
    phoneNumber: string,
  ): Promise<Either<Error, Result<string>>> {
    const accountSid = this.configService.get<string>(
      TWILIO_CONSTANTS.accountSid,
    );
    const authToken = this.configService.get<string>(
      TWILIO_CONSTANTS.authToken,
    );
    const verifySid = this.configService.get<string>(
      TWILIO_CONSTANTS.verifySid,
    );
    const client = twilio(accountSid, authToken);
    try {
      const response = await client.verify.v2
        .services(verifySid)
        .verifications.create({ to: `${phoneNumber}`, channel: 'sms' })
        .then((verification) => verification.sid);
      return right(Result.ok<string>(response));
    } catch (error) {
      Logger.log(error, error.stack);
      return left(error);
    }
  }

  async verifyCode(
    phoneNumber: string,
    code: string,
  ): Promise<Either<Error, Result<boolean>>> {
    const accountSid = this.configService.get<string>(
      TWILIO_CONSTANTS.accountSid,
    );
    const authToken = this.configService.get<string>(
      TWILIO_CONSTANTS.authToken,
    );
    const verifySid = this.configService.get<string>(
      TWILIO_CONSTANTS.verifySid,
    );
    const client = twilio(accountSid, authToken);
    try {
      const response = await client.verify.v2
        .services(verifySid)
        .verificationChecks.create({ to: `${phoneNumber}`, code: code })
        .then((verificationCheck) => verificationCheck.valid);
      return right(Result.ok<boolean>(response));
    } catch (error) {
      Logger.log(error, error.stack);
      return left(error);
    }
  }
}
