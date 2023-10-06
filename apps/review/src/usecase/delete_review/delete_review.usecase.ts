/* eslint-disable @typescript-eslint/no-unused-vars */
import * as AppErrors from '@app/common/core/app.error';
import { UniqueEntityID } from '@app/common/core/domain/unique_entity_id';
import { Either, Result, left, right } from '@app/common/core/result';
import { UseCase } from '@app/common/core/usecase';
import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DeleteReviewDTO } from './delete_review.dto';
import { AUTH_SERVICE, DESTINATION_SERVICE } from '@app/common/global/services';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { ReviewService } from '../../review.service';
import { StorageService } from '@app/common/storage/storage.service';
import { ERROR_CODE, STORAGE_PATH } from '@app/common/constants';
import * as ReviewErrors from '../errors/review.errors';
import { UserProfileResponseDTO } from '../../../../auth/user/usecase/get_profile/get_profile.dto';
import { ReviewId } from '../../entity/review_id';
import { UserId } from 'apps/auth/user/domain/user_id';

/* eslint-disable prettier/prettier */
type Response = Either<
  AppErrors.EntityNotFoundError | AppErrors.InvalidPayloadError | ReviewErrors.ReviewDoesNotBelongToUser,
  Result<void>
>;

type DeleteReviewDTOWithUserId = {
    userId: string;
    request: DeleteReviewDTO;
}

@Injectable()
export class UpdateReviewUseCase implements UseCase<DeleteReviewDTOWithUserId, Promise<Response>>
{
  constructor(
    private readonly reviewService: ReviewService,
    private readonly storageService: StorageService,
    @Inject(AUTH_SERVICE) private readonly authClient: ClientProxy,
    @Inject(DESTINATION_SERVICE) private readonly destinationClient: ClientProxy,
  ) {}

  execute = async (payload: DeleteReviewDTOWithUserId): Promise<Response> => {
    try {
      const { userId, request } = payload;
      const userIdOrError = UserId.create(new UniqueEntityID(userId));

      // kiểm tra xem user có tồn tại hay không
      const userOrError : UserProfileResponseDTO = await firstValueFrom(this.authClient.send('get_user_profile', { userId: userId })); 
       // chưa handle trường hợp không có user      
      
      const reviewIdOrError = ReviewId.create(new UniqueEntityID(request.reviewId));
      const reviewOrError = await this.reviewService.getReviewById(reviewIdOrError);

      if (reviewOrError === undefined) {
        return left(new AppErrors.EntityNotFoundError('Review'));
      }

      if (reviewOrError.userId.getValue().toString() !== userOrError.id) {
        return left(new ReviewErrors.ReviewDoesNotBelongToUser());
      }

      reviewOrError.isDeleted = true;

      const result = await this.reviewService.updateReview(reviewOrError);

      Logger.log(result);
      return right(Result.ok<any>({
        message: "Delete review successfully",
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
