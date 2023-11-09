import { firebaseAdmin } from '@app/common';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../user/users.service';
import { JwtService } from '@nestjs/jwt';
import { JWT_CONSTANTS, OAUTH2_CONSTANTS } from './constants';
import { User } from '../user/domain/user.entity';
import { UserPhoneNumber } from '../user/domain/user_phonenumber';
import { RegistrationQueueRepository } from './registration_queue.repo';

export interface firebaseAuthPayload {
  token: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly registrationQueueRepository: RegistrationQueueRepository,
  ) {}

  // Authenticate bằng Firebase
  async firebaseAuthenticateWithToken(request: firebaseAuthPayload) {
    try {
      // eslint-disable-next-line no-console
      Logger.log(request);
      const decodedIdToken = await firebaseAdmin.verifyIdToken({
        idToken: request.token,
        audience: [
          this.configService.get<string>(OAUTH2_CONSTANTS.WebClientID),
          this.configService.get<string>(OAUTH2_CONSTANTS.AndroidClientID),
        ],
      });
      Logger.log(decodedIdToken.getPayload());
      return decodedIdToken;
    } catch (err) {
      // eslint-disable-next-line no-console
      Logger.error(err, err.stack);
      return null;
    }
  }

  // Tạo token mới cho user
  async generateAccessToken(user: User) {
    const jwtPayload = {
      sub: user.userId.getValue().toString(),
      username: user.email?.value ?? user.phoneNumber?.value,
      //username key here should be email
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(jwtPayload, {
        secret: this.configService.get<string>(JWT_CONSTANTS.AccessSecretKey),
        expiresIn: '7d',
      }),
      this.jwtService.signAsync(jwtPayload, {
        secret: this.configService.get<string>(JWT_CONSTANTS.RefreshSecretKey),
        expiresIn: '15d',
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  // Verify token đó liệu đã đúng hay chưa
  async validateToken(token: string, tokenType: string) {
    const foundUser =
      tokenType === 'accessToken'
        ? await this.usersService.getUserByAccessToken(token)
        : await this.usersService.getUserByRefreshToken(token);

    return foundUser !== undefined;
  }

  async upsertRegistration(phoneNumber: UserPhoneNumber, tries: number) {
    return await this.registrationQueueRepository.upsertRegistration({
      phoneNumber: phoneNumber.value,
      tries: tries,
    });
  }

  async deleteRegistration(phoneNumber: UserPhoneNumber) {
    return await this.registrationQueueRepository.deleteRegistration(
      phoneNumber.value,
    );
  }

  async getRegistrationByPhoneNumber(phoneNumber: string) {
    return await this.registrationQueueRepository.findRegistrationByEmail(
      phoneNumber,
    );
  }
}
