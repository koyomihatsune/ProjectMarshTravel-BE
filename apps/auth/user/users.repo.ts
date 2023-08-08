import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { AbstractRepository } from '@app/common';
import { UserDAO } from './schemas/user.schema';
import { CreateUserRequest } from './service_dto/create-user.request';
import { User } from './domain/user.entity';
import { UserMapper } from './mapper/user.mapper';
import { UserId } from './domain/user_id';
import { UserEmail } from './domain/user_email';
import { UserUsername } from './domain/user_username';
import { UserName } from './domain/user_name';
import { UserDOB } from './domain/user_dob';

@Injectable()
export class UsersRepository extends AbstractRepository<UserDAO> {
  protected readonly logger = new Logger(UsersRepository.name);

  constructor(
    @InjectModel(UserDAO.name) userModel: Model<UserDAO>,
    @InjectConnection() connection: Connection,
  ) {
    super(userModel, connection);
  }

  async createUser(request: CreateUserRequest): Promise<User | undefined> {
    try {
      const user = await this.create({
        name: request.name.value,
        email: request.email.value,
        provider: request.provider.value,
        username: request.username.value,
        accessToken: '',
        refreshToken: '',
        createdAt: new Date(),
      });
      return UserMapper.toEntity(user);
    } catch (err) {
      return undefined;
    }
  }

  updateUser = async (
    id: UserId,
    payload: {
      name?: UserName;
      username?: UserUsername;
      dob?: UserDOB;
    },
  ) => {
    try {
      const payloadDAO = {
        name: payload.name?.value,
        username: payload.username?.value,
        dob: payload.dob?.value,
      };
      await this.upsert(
        {
          _id: id.getValue().toMongoObjectID(),
        },
        payloadDAO,
      );
      return true;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      return false;
    }
  };

  async getUserByEmail(email: UserEmail): Promise<User | undefined> {
    try {
      const user = await this.findOne({ email: email.value });
      return UserMapper.toEntity(user);
    } catch (err) {
      return undefined;
    }
  }

  async getUserByUsername(username: UserUsername): Promise<User | undefined> {
    try {
      const user = await this.findOne({ username: username.value });
      return UserMapper.toEntity(user);
    } catch (err) {
      return undefined;
    }
  }

  getUserByAccessToken = async (token: string): Promise<User | undefined> => {
    try {
      const user = await this.findOne({ accessToken: token });
      return UserMapper.toEntity(user);
    } catch (err) {
      return undefined;
    }
  };

  getUserByRefreshToken = async (token: string): Promise<User | undefined> => {
    try {
      const user = await this.findOne({ refreshToken: token });
      return UserMapper.toEntity(user);
    } catch (err) {
      return undefined;
    }
  };

  updateUserToken = async (
    id: UserId,
    tokenPayload: {
      accessToken?: string;
      refreshToken?: string;
    },
  ) => {
    return this.upsert(
      {
        _id: id.getValue().toMongoObjectID(),
      },
      tokenPayload,
    );
  };
}
