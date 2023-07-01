import { firebaseAdmin } from '@app/common';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from './users/users.service';

export interface TokenPayload {
  token: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {}

  async firebaseAuthenticateWithToken(request: TokenPayload) {
    const decodedToken = await firebaseAdmin
      .auth()
      .verifyIdToken(request.token);
    // const userId = decodedToken.uid;
    // eslint-disable-next-line no-console

    // trả về success kèm jwt
    const userLoginResult = await this.usersService.loginWithEmail({
      email: decodedToken.email,
      provider: 'firebase_google',
      googleDecodedToken: decodedToken,
    });

    return userLoginResult;
    // })
  }
}
