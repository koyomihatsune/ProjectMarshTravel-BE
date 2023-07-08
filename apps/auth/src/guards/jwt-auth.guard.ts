import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs/internal/Observable';
import {
  BYPASS_GLOBAL_AUTH_GUARD,
  IS_PUBLIC_KEY,
} from '../decorators/auth.decorator';
import { ERROR_CODE } from '@app/common/constants';
import { API_MESSAGE } from '@app/common/constants/string.constants';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  handleRequest(err: any, user: any) {
    if (err || !user) {
      throw (
        err ||
        new UnauthorizedException({
          code: ERROR_CODE.InvalidToken,
          message: API_MESSAGE.InvalidToken,
        })
      );
    }
    return user;
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const bypassGlobalGuard = this.reflector.getAllAndOverride<boolean>(
      BYPASS_GLOBAL_AUTH_GUARD,
      [context.getHandler(), context.getClass()],
    );

    if (bypassGlobalGuard) {
      return true;
    }

    return super.canActivate(context);
  }
}
