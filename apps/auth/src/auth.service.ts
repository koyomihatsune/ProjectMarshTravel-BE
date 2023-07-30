import { firebaseAdmin } from '@app/common';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from './user/users.service';
import { JwtService } from '@nestjs/jwt';
import { JWT_CONSTANTS, OAUTH2_CONSTANTS } from './constants';
import { User } from './user/domain/user.entity';
export interface firebaseAuthPayload {
  token: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  // Authenticate bằng Firebase
  async firebaseAuthenticateWithToken(request: firebaseAuthPayload) {
    try {
      const decodedIdToken = await firebaseAdmin.verifyIdToken({
        idToken: request.token,
        audience: [
          this.configService.get<string>(OAUTH2_CONSTANTS.WebClientID),
          this.configService.get<string>(OAUTH2_CONSTANTS.AndroidClientID),
        ],
      });
      return decodedIdToken;
    } catch (err) {
      return null;
    }
  }

  // Tạo token mới cho user
  async generateAccessToken(user: User) {
    const jwtPayload = {
      sub: user.userId.getValue().toString(),
      username: user.email.value,
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
}
