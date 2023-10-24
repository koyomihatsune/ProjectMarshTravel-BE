/* eslint-disable @typescript-eslint/no-unused-vars */
import * as AppErrors from '@app/common/core/app.error';
import { UniqueEntityID } from '@app/common/core/domain/unique_entity_id';
import {
  Either,
  Result,
  ResultRPC,
  left,
  right,
} from '@app/common/core/result';
import { UseCase } from '@app/common/core/usecase';
import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { AUTH_SERVICE, DESTINATION_SERVICE } from '@app/common/global/services';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { UserId } from 'apps/auth/user/domain/user_id';
import { StorageService } from '@app/common/storage/storage.service';
import { ERROR_CODE, STORAGE_PATH } from '@app/common/constants';
import { v1 as uuidv1 } from 'uuid';
import * as FollowCommitAdmUseCaseErrors from './province_follow_commit.errors';
import { ReviewService } from 'apps/review/src/review.service';
import { ReviewId } from 'apps/review/src/entity/review_id';
import { ProvinceFollowCommitDTO } from './province_follow_commit.dto';
import { FollowedAdministrativeService } from '../../followed_administrative.service';
import { AdministrativeService } from 'apps/destination/administrative/administrative.service';
import { FollowedAdministrativeRepository } from '../../followed_administrative.repo';

/* eslint-disable prettier/prettier */
type Response = Either<
  AppErrors.EntityNotFoundError | AppErrors.InvalidPayloadError | FollowCommitAdmUseCaseErrors.AdmCurrentStateIsNotFollowed | FollowCommitAdmUseCaseErrors.AdmCurrentStateIsFollowed,
  Result<void>
>;

type ProvinceFollowCommitDTOWithUserId = {
    userId: string;
    request: ProvinceFollowCommitDTO;
}

@Injectable()
export class ProvinceFollowCommitUseCase implements UseCase<ProvinceFollowCommitDTOWithUserId, Promise<Response>>
{
  constructor(  
    private readonly administrativeService: AdministrativeService,
    private readonly followedAdministrativeService: FollowedAdministrativeService,
  ) {}

  execute = async (payload: ProvinceFollowCommitDTOWithUserId): Promise<Response> => {
    try {
      const { userId, request } = payload;
      const userIdOrError = UserId.create(new UniqueEntityID(userId));

      // chưa handle trường hợp không có user
      const foundProvince = await this.administrativeService.getProvinceDetailsByCode(request.code);
      if (foundProvince === undefined) {
        return left(new AppErrors.EntityNotFoundError('Province'));
      }

      const provinceFollowRecord = await this.followedAdministrativeService.getFollowedAdministrative(userIdOrError, request.code, 'province');
    
      // console.log(reviewSaveRecord);

      if (request.follow === true) {
        if (provinceFollowRecord === undefined) {
          const result = await this.followedAdministrativeService.createFollowedAdministrative(userIdOrError, request.code, 'province');
          if (result === false) {
            return left(new AppErrors.UnexpectedError("This administrative region can't be followed"));
          }
        } else {
          return left(new FollowCommitAdmUseCaseErrors.AdmCurrentStateIsFollowed());
        }
      } else {
        if (provinceFollowRecord !== undefined) {
          const result = await this.followedAdministrativeService.deleteFollowedAdministrative(userIdOrError, request.code, 'province');
          if (result === false) {
            return left(new AppErrors.UnexpectedError("This administrative region can't be unfollowed"));
          }
        } else {
          return left(new FollowCommitAdmUseCaseErrors.AdmCurrentStateIsNotFollowed());
        }
      }

      return right(Result.ok<any>({
        message: "Follow/unfollow administrative successfully",
      }));
    } catch (err) {
      Logger.log(err, err.stack);
      if (err.status === 404) {
        return left(new AppErrors.EntityNotFoundError('User'));
      }
      return left(new AppErrors.UnexpectedError(err));
    }
  };
}
