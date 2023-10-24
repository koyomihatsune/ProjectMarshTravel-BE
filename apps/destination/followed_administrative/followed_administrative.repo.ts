/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Model, Connection, Types } from 'mongoose';
import { AbstractRepository } from '@app/common';
import { UserId } from 'apps/auth/user/domain/user_id';
import { Result } from '@app/common/core/result';
import { Pagination } from '@app/common/core/pagination/pagination.type';
import { SORT_CONST } from '@app/common/constants';
import { UniqueEntityID } from '../../../libs/common/src/core/domain/unique_entity_id';
import { FollowedAdministrativeDAO } from './schema/followed_administrative.schema';

@Injectable()
export class FollowedAdministrativeRepository extends AbstractRepository<FollowedAdministrativeDAO> {
  protected readonly logger = new Logger(FollowedAdministrativeRepository.name);

  constructor(
    @InjectModel(FollowedAdministrativeDAO.name)
    followedAdministrativeModel: Model<FollowedAdministrativeDAO>,
    @InjectConnection() connection: Connection,
  ) {
    super(followedAdministrativeModel, connection);
  }

  async createFollowedAdministrative(
    userId: UserId,
    code: string,
    type: string,
  ): Promise<boolean> {
    try {
      const DAO = {
        userId: userId.getValue().toMongoObjectID(),
        code: code,
        type: type,
      };

      await this.create({
        ...DAO,
      });
      return true;
    } catch (err) {
      Logger.error(err, err.stack);
      return false;
    }
  }

  async deleteFollowedAdministrative(
    userId: UserId,
    code: string,
    type: string,
  ): Promise<boolean> {
    try {
      const result = await this.model.deleteOne({
        userId: userId.getValue().toMongoObjectID(),
        code: code,
        type: type,
      });
      return true;
    } catch (err) {
      Logger.error(err, err.stack);
      return false;
    }
  }

  async findFollowedAdministrative(
    userId: UserId,
    code: string,
    type: string,
  ): Promise<FollowedAdministrativeDAO | undefined> {
    try {
      const result = await this.model.findOne({
        userId: userId.getValue().toMongoObjectID(),
        code: code,
        type: type,
      });
      return result ?? undefined;
    } catch (err) {
      Logger.error(err, err.stack);
      return undefined;
    }
  }

  async findFollowedAdministrativesByUserId(
    userId: UserId,
    type: string,
  ): Promise<string[]> {
    try {
      const result = await this.find({
        userId: userId.getValue().toMongoObjectID(),
        type: type,
      });
      return result.map((followedAdministrative) => {
        return followedAdministrative.code;
      });
    } catch (err) {
      Logger.error(err, err.stack);
      return [];
    }
  }
}
