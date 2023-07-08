import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { TokenPayload, UsersService } from '../users/users.service';
import { JWT_CONSTANTS } from '../constants';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: any) => {
          return request?.Authentication;
        },
      ]),
      secretOrKey: configService.get(JWT_CONSTANTS.AccessSecretKey),
    });
  }

  async validate({ accessToken }: TokenPayload) {
    try {
      return await this.usersService.getUserByAccessToken(accessToken);
    } catch (err) {
      throw new UnauthorizedException();
    }
  }
}
