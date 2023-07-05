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
    try {
      const decodedIdToken = await firebaseAdmin
        .auth()
        .verifyIdToken(request.token);
      return decodedIdToken;
    } catch (err) {
      return null;
    }
    // const userId = decodedToken.uid;
    // eslint-disable-next-line no-console
    // trả về success kèm jwt
    // })
  }
}
