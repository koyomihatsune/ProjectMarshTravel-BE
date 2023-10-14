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
import * as SaveCommitReviewUseCaseErrors from './review_save_commit.errors';
import { ReviewService } from 'apps/review/src/review.service';
import { ReviewId } from 'apps/review/src/entity/review_id';
import { SaveCommitReviewDTO } from './review_save_commit.dto';
import { SavedReviewService } from '../../saved_review.service';

/* eslint-disable prettier/prettier */
type Response = Either<
  AppErrors.EntityNotFoundError | AppErrors.InvalidPayloadError | SaveCommitReviewUseCaseErrors.ReviewCurrentStateIsNotSaved | SaveCommitReviewUseCaseErrors.ReviewCurrentStateIsSaved,
  Result<void>
>;

type SaveCommitReviewDTOWithUserId = {
    userId: string;
    request: SaveCommitReviewDTO;
}

@Injectable()
export class SaveCommitReviewUseCase implements UseCase<SaveCommitReviewDTOWithUserId, Promise<Response>>
{
  constructor(
    private readonly reviewService: ReviewService,
    private readonly savedReviewService: SavedReviewService,
    @Inject(AUTH_SERVICE) private readonly authClient: ClientProxy,
  ) {}

  execute = async (payload: SaveCommitReviewDTOWithUserId): Promise<Response> => {
    try {
      const { userId, request } = payload;
      const userIdOrError = UserId.create(new UniqueEntityID(userId));
      const reviewIdOrError = ReviewId.create(new UniqueEntityID(request.reviewId));

      // chưa handle trường hợp không có user
      const reviewOrError = this.reviewService.getReviewById(reviewIdOrError);
      if (reviewOrError === undefined) {
        return left(new AppErrors.EntityNotFoundError('Review'));
      }

      const reviewSaveRecord = await this.savedReviewService.getSavedReview(userIdOrError, reviewIdOrError);

      // console.log(reviewSaveRecord);

      if (request.save === true) {
        if (reviewSaveRecord === undefined) {
          const result = await this.savedReviewService.createSavedReview(userIdOrError, reviewIdOrError);
          if (result === false) {
            return left(new AppErrors.UnexpectedError("Review can't be saved"));
          }
        } else {
          return left(new SaveCommitReviewUseCaseErrors.ReviewCurrentStateIsSaved());
        }
      } else {
        if (reviewSaveRecord !== undefined) {
          const result = await this.savedReviewService.deleteSavedReview(userIdOrError, reviewIdOrError);
          if (result === false) {
            return left(new AppErrors.UnexpectedError("Review can't be unsaved"));
          }
        } else {
          return left(new SaveCommitReviewUseCaseErrors.ReviewCurrentStateIsNotSaved());
        }
      }

      return right(Result.ok<any>({
        message: "Save/unsave review successfully",
      }));
    } catch (err) {
      Logger.log(err, err.stack);
      if (err.status === 404) {
        return left(new AppErrors.EntityNotFoundError('User'));
      } else if (err.response?.code === ERROR_CODE.DestinationNotFound){
        return left(new AppErrors.GoogleMapsError());
      }
      return left(new AppErrors.UnexpectedError(err));
    }
  };
}
