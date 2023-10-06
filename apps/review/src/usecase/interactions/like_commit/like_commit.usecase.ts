/* eslint-disable @typescript-eslint/no-unused-vars */
import * as AppErrors from '@app/common/core/app.error';
import { UniqueEntityID } from '@app/common/core/domain/unique_entity_id';
import { Either, Result, left, right } from '@app/common/core/result';
import { UseCase } from '@app/common/core/usecase';
import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { AUTH_SERVICE, DESTINATION_SERVICE } from '@app/common/global/services';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { StorageService } from '@app/common/storage/storage.service';
import { ERROR_CODE, STORAGE_PATH } from '@app/common/constants';
import { UserId } from 'apps/auth/user/domain/user_id';
import { LikeCommitReviewDTO } from './like_commit.dto';
import { ReviewService } from 'apps/review/src/review.service';
import { UserProfileResponseDTO } from 'apps/auth/user/usecase/get_profile/get_profile.dto';
import { ReviewId } from 'apps/review/src/entity/review_id';
import * as ReviewErrors from '../../errors/review.errors';

/* eslint-disable prettier/prettier */
type Response = Either<
  AppErrors.EntityNotFoundError | AppErrors.InvalidPayloadError ,
  Result<void>
>;

type LikeCommitReviewDTOWithUserId = {
    userId: string;
    request: LikeCommitReviewDTO;
}

@Injectable()
export class LikeCommitReviewUseCase implements UseCase<LikeCommitReviewDTOWithUserId, Promise<Response>>
{
  constructor(
    private readonly reviewService: ReviewService,
    @Inject(AUTH_SERVICE) private readonly authClient: ClientProxy,
  ) {}

  execute = async (payload: LikeCommitReviewDTOWithUserId): Promise<Response> => {
    try {
      const { userId, request } = payload;
      const userIdOrError = UserId.create(new UniqueEntityID(userId));
      
      const reviewIdOrError = ReviewId.create(new UniqueEntityID(request.reviewId));

      const result = request.like === true ? await this.reviewService.like(reviewIdOrError, userIdOrError)
        : request.like === false ? await this.reviewService.unlike(reviewIdOrError, userIdOrError) 
        : Result.fail<void>("Invalid payload");

      if (result.isSuccess) {
        return right(Result.ok<any>({
          message: "React sucessfully",
        }));
      } else {
        return left(new AppErrors.UnexpectedError('React failed. ReviewId is not valid. Please make sure that it exist in the system.'));
      }
      
    } catch (err) {
      Logger.log(err, err.stack);
      if (err.status === 404) {
        return left(new AppErrors.EntityNotFoundError('User'));
      }
      return left(new AppErrors.UnexpectedError(err));
    }
  };
}
