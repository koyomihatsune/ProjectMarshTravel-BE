/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable, Logger } from '@nestjs/common';
import { StorageService } from '@app/common/storage/storage.service';
import { Pagination } from '@app/common/core/pagination/pagination.type';
import { UserId } from 'apps/auth/user/domain/user_id';
import { Result } from '@app/common/core/result';
import { SORT_CONST } from '@app/common/constants';
import { FollowedAdministrativeRepository } from './followed_administrative.repo';
import { UniqueEntityID } from '@app/common/core/domain/unique_entity_id';
import { FollowedAdministrativeDAO } from './schema/followed_administrative.schema';

@Injectable()
export class FollowedAdministrativeService {
  constructor(
    private readonly followedAdmRepo: FollowedAdministrativeRepository,
  ) {}

  async createFollowedAdministrative(
    userId: UserId,
    code: string,
    type: string,
  ): Promise<boolean> {
    const result = await this.followedAdmRepo.createFollowedAdministrative(
      userId,
      code,
      type,
    );
    return result;
  }

  async deleteFollowedAdministrative(
    userId: UserId,
    code: string,
    type: string,
  ): Promise<boolean> {
    const result = await this.followedAdmRepo.deleteFollowedAdministrative(
      userId,
      code,
      type,
    );
    return result;
  }

  async getFollowedAdministrative(
    userId: UserId,
    code: string,
    type: string,
  ): Promise<FollowedAdministrativeDAO | undefined> {
    const result = await this.followedAdmRepo.findFollowedAdministrative(
      userId,
      code,
      type,
    );
    return result;
  }

  async getFollowedAdministrativesByUserId(
    userId: UserId,
    type: string,
  ): Promise<string[]> {
    const result =
      await this.followedAdmRepo.findFollowedAdministrativesByUserId(
        userId,
        type,
      );
    return result;
  }
}
