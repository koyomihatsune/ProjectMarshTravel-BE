import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JWT_CONSTANTS } from '../constants';
import { ContextIdFactory, ModuleRef } from '@nestjs/core';
import { ERROR_CODE } from '@app/common/constants';
import { API_MESSAGE } from '@app/common/constants/string.constants';
import { AuthService } from '../auth.service';
import { verifyTokenFromReq } from './strategy_helpers';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService, private moduleRef: ModuleRef) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: any) => {
          return request?.Authentication;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>(JWT_CONSTANTS.AccessSecretKey),
      passReqToCallback: true,
    });
  }

  async validate(request: any, payload: any) {
    const contextId = ContextIdFactory.getByRequest(request);
    const authService = await this.moduleRef.resolve(AuthService, contextId);

    const valid = await verifyTokenFromReq(request, 'accessToken', authService);

    if (!valid) {
      throw new UnauthorizedException({
        code: ERROR_CODE.InvalidToken,
        message: API_MESSAGE.InvalidToken,
      });
    }
    return payload;
  }
}
