import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Model, Connection, Types } from 'mongoose';
import { AbstractRepository } from '@app/common';
import { User } from './schemas/user.schema';
import { CreateUserRequest } from './dto/create-user.request';

@Injectable()
export class UsersRepository extends AbstractRepository<User> {
  protected readonly logger = new Logger(UsersRepository.name);

  constructor(
    @InjectModel(User.name) userModel: Model<User>,
    @InjectConnection() connection: Connection,
  ) {
    super(userModel, connection);
  }

  async createUser(request: CreateUserRequest) {
    const user = await this.create({
      ...request,
      accessToken: '',
      refreshToken: '',
      createdAt: new Date(),
    });
    return user;
  }

  async getUserByEmail(email: string) {
    try {
      const user = await this.findOne({ email: email });
      return user;
    } catch (err) {
      return null;
    }
  }

  getUserByAccessToken = async (token: string) => {
    return this.findOne({
      accessToken: token,
    });
  };

  getUserByRefreshToken = async (token: string) => {
    return this.findOne({
      refreshToken: token,
    });
  };

  updateUserToken = async (
    _id: Types.ObjectId,
    tokenPayload: {
      accessToken?: string;
      refreshToken?: string;
    },
  ) => {
    return this.upsert(
      {
        _id: _id,
      },
      tokenPayload,
    );
  };
}
