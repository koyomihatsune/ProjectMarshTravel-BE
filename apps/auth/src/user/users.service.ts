import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { UsersRepository } from './users.repo';
import { CreateUserRequest } from './service_dto/create-user.request';
import { AuthService } from '../auth.service';
import { User } from './domain/user.entity';
import { UserEmail } from './domain/user_email';
import { UserMapper } from './mapper/user.mapper';
import { UserId } from './domain/user_id';
import { UpdateUserProfileEntityDTO } from './usecase/update_profile/update_profile.dto';
import { UserUsername } from './domain/user_username';

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

  async createUser(request: CreateUserRequest): Promise<User> {
    const user = await this.usersRepository.createUser(request);
    return user;
  }

  async updateUser(
    id: UserId,
    request: UpdateUserProfileEntityDTO,
  ): Promise<boolean> {
    return await this.usersRepository.updateUser(id, request);
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

  async getUserByUsername(username: UserUsername): Promise<User> {
    const user = await this.usersRepository.getUserByUsername(username);
    return user;
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
