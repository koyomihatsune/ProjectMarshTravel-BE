import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { UsersRepository } from './users.repo';
import { CreateUserRequest } from './dtos/service_dto/create-user.request';
import { AuthService } from '../src/auth.service';
import { User } from './domain/user.entity';
import { UserEmail } from './domain/user_email';
import { UserMapper } from './mapper/user.mapper';
import { UserId } from './domain/user_id';
import { UpdateUserProfileEntityDTO } from './usecase/update_profile/update_profile.dto';
import { UserUsername } from './domain/user_username';
import { Either, left, right } from '@app/common/core/result';
import * as AppErrors from '@app/common/core/app.error';
import { StorageService } from '@app/common/storage/storage.service';
import { STORAGE_PATH } from '@app/common/constants';
export interface TokenPayload {
  accessToken: string;
}
@Injectable()
export class UsersService {
  constructor(
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
    private readonly usersRepository: UsersRepository,
    private readonly storageService: StorageService,
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
    const user = await this.usersRepository.findUserByEmail(email);
    return user;
  }

  async getUser(id: UserId): Promise<User> {
    const result = await this.usersRepository.findOne({
      _id: id.getValue().toMongoObjectID(),
    });
    return UserMapper.toEntity(result);
  }

  async getUsers(ids: UserId[]): Promise<User[]> {
    const result = await this.usersRepository.findAllByList(
      '_id',
      ids.map((id) => id.getValue().toMongoObjectID()),
    );
    return result.map((userDAO) => UserMapper.toEntity(userDAO));
  }

  async getUserByUsername(username: UserUsername): Promise<User> {
    const user = await this.usersRepository.findUserByUsername(username);
    return user;
  }

  async getUserByAccessToken(token: string): Promise<User> {
    const user = await this.usersRepository.findUserByAccessToken(token);
    return user;
  }

  async getUserByRefreshToken(token: string): Promise<User> {
    const user = await this.usersRepository.findUserByRefreshToken(token);
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

  updateUserAvatar = async (
    userId: UserId,
    userPayload: {
      avatar: Express.Multer.File;
    },
  ): Promise<Either<AppErrors.UnexpectedError, string>> => {
    // Send image to GCS and Take Link Url
    const imageUrl = await this.storageService.uploadFileToStorage(
      userPayload.avatar,
      STORAGE_PATH.UserAvatar,
      `user-avatar-${userId.getValue().toString()}`,
    );
    if (imageUrl.isLeft()) {
      return left(imageUrl.value);
    }

    await this.usersRepository.upsert(
      {
        _id: userId.getValue().toBuffer(),
      },
      { avatarUrl: imageUrl.value },
    );

    return right(imageUrl.value);
  };
}
