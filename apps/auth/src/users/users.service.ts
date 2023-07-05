import {
  Injectable,
  UnprocessableEntityException,
  // UnauthorizedException,
  // UnprocessableEntityException,
} from '@nestjs/common';
import { UsersRepository } from './users.repo';
import { CreateUserRequest } from './dto/create-user.request';
import { User } from './schemas/user.schema';
import { DecodedIdToken } from 'firebase-admin/lib/auth/token-verifier';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async loginWithEmail(request: {
    email: string;
    provider: string;
    googleDecodedToken?: DecodedIdToken;
  }) {
    // Kiểm tra email có tồn tại hay không, nếu không thì tạo user mới luôn, rồi tạo JWT.
    const user = await this.getUserByEmail(request.email);

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
        await this.createUser(createUserRequestDTO);
      }
    }
    // Generate JWT Token cho user đã tồn tại trên hệ thống
    return {
      accessToken: '',
      refreshToken: '',
      isNewAccount: user ? false : true,
    };
  }

  async createUser(request: CreateUserRequest) {
    const user = await this.usersRepository.create({
      ...request,
    });
    return user;
  }

  async getUserByEmail(email: string) {
    let user: User;
    try {
      user = await this.usersRepository.findOne({
        email: email,
      });
      return user;
    } catch (err) {
      return new UnprocessableEntityException('user');
    }
  }
}
