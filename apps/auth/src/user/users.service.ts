import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { UsersRepository } from './users.repo';
import { CreateUserRequest } from './dto/create-user.request';
import { DecodedIdToken } from 'firebase-admin/lib/auth/token-verifier';
import { AuthService } from '../auth.service';
import { User } from './domain/user.entity';
import { UserEmail } from './domain/user_email';
import { UserMapper } from './mapper/user.mapper';
import { UserId } from './domain/user_id';

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
    const userEmailOrError = UserEmail.create({ value: request.email });
    if (userEmailOrError.isFailure) {
      throw new Error('Email không hợp lệ');
    }
    // Kiểm tra email có tồn tại hay không, nếu không thì tạo user mới luôn, rồi tạo JWT.
    let user: User = await this.getUserByEmail(userEmailOrError.getValue());
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

    await this.updateUserToken(user.userId, {
      accessToken: token.accessToken,
      refreshToken: token.refreshToken,
    });

    return {
      accessToken: token.accessToken,
      refreshToken: token.refreshToken,
      isNewAccount: initUser,
    };
  }

  async createUser(request: CreateUserRequest): Promise<User> {
    const user = await this.usersRepository.createUser(request);
    return user;
  }

  async getUserByEmail(email: UserEmail): Promise<User> {
    const user = await this.usersRepository.getUserByEmail(email);
    return user;
  }

  async getUser(id: UserId): Promise<User> {
    const result = await this.usersRepository.findOne({
      _id: id.getValue().toMongoObjectID(),
    });
    return UserMapper.toEntity(result);
  }

  async getUserByAccessToken(token: string): Promise<User> {
    const user = await this.usersRepository.getUserByAccessToken(token);
    return user;
  }

  async getUserByRefreshToken(token: string): Promise<User> {
    const user = await this.usersRepository.getUserByRefreshToken(token);
    return user;
  }

  async updateUserToken(
    id: UserId,
    tokenPayload: {
      accessToken?: string;
      refreshToken?: string;
    },
  ) {
    return this.usersRepository.updateUserToken(id, tokenPayload);
  }
}
