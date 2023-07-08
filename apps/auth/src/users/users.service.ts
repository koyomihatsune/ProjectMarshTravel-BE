import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { UsersRepository } from './users.repo';
import { CreateUserRequest } from './dto/create-user.request';
import { DecodedIdToken } from 'firebase-admin/lib/auth/token-verifier';
import { AuthService } from '../auth.service';
import { Types } from 'mongoose';

export interface TokenPayload {
  accessToken: string;
}
@Injectable()
export class UsersService {
  constructor(
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
    private readonly usersRepository: UsersRepository,
  ) {}

  async loginWithEmail(request: {
    email: string;
    provider: string;
    googleDecodedToken?: DecodedIdToken;
  }) {
    // Kiểm tra email có tồn tại hay không, nếu không thì tạo user mới luôn, rồi tạo JWT.
    let user = await this.getUserByEmail(request.email);
    let initUser = false;

    // User chưa tồn tại, tạo user mới
    if (!user) {
      let decodedToken: DecodedIdToken | null;
      if (request.provider === 'firebase_google') {
        decodedToken = request.googleDecodedToken;
        const createUserRequestDTO: CreateUserRequest = {
          email: decodedToken.email,
          provider: decodedToken.firebase.sign_in_provider,
          name: decodedToken.name,
        };
        user = await this.createUser(createUserRequestDTO);
        initUser = true;
      }
    }

    const token = await this.authService.generateAccessToken(user);
    // Trong trường hợp token không dùng được
    // const token = {
    //   accessToken: 'a',
    //   refreshToken: 'b',
    // };

    await this.updateUserToken(user._id, {
      accessToken: token.accessToken,
      refreshToken: token.refreshToken,
    });

    return {
      accessToken: token.accessToken,
      refreshToken: token.refreshToken,
      isNewAccount: initUser,
    };
  }

  async createUser(request: CreateUserRequest) {
    const user = await this.usersRepository.createUser(request);
    return user;
  }
  async getUserByEmail(email: string) {
    const user = await this.usersRepository.getUserByEmail(email);
    return user;
  }

  async getUser(_id: Types.ObjectId) {
    const user = await this.usersRepository.findOne({
      _id: _id,
    });
    return user;
  }

  getUserByAccessToken = async (token: string) => {
    return this.usersRepository.getUserByAccessToken(token);
  };

  getUserByRefreshToken = async (token: string) => {
    return this.usersRepository.getUserByRefreshToken(token);
  };

  updateUserToken = async (
    _id: Types.ObjectId,
    tokenPayload: {
      accessToken?: string;
      refreshToken?: string;
    },
  ) => {
    return this.usersRepository.updateUserToken(_id, tokenPayload);
  };
}
