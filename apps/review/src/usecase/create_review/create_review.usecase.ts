/* eslint-disable @typescript-eslint/no-unused-vars */
import * as AppErrors from '@app/common/core/app.error';
import { UniqueEntityID } from '@app/common/core/domain/unique_entity_id';
import { Either, Result, left, right } from '@app/common/core/result';
import { UseCase } from '@app/common/core/usecase';
import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateReviewDTO } from './create_review.dto';
import { AUTH_SERVICE } from '@app/common/global/services';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { Review } from '../../entity/review.entity';
import { UserId } from 'apps/auth/user/domain/user_id';
import { ReviewService } from '../../review.service';
import { StorageService } from '@app/common/storage/storage.service';
import { STORAGE_PATH } from '@app/common/constants';
import { v1 as uuidv1 } from 'uuid';

/* eslint-disable prettier/prettier */
type Response = Either<
  AppErrors.EntityNotFoundError | AppErrors.InvalidPayloadError,
  Result<void>
>;

type CreateReviewDTOWithUserId = {
    userId: string;
    request: CreateReviewDTO;
}

@Injectable()
export class CreateReviewUseCase implements UseCase<CreateReviewDTOWithUserId, Promise<Response>>
{
  constructor(
    private readonly reviewService: ReviewService,
    private readonly storageService: StorageService,
    @Inject(AUTH_SERVICE) private readonly authClient: ClientProxy,
  ) {}

  execute = async (payload: CreateReviewDTOWithUserId): Promise<Response> => {
    try {
      
      const { userId, request } = payload;
      const userIdOrError = new UniqueEntityID(userId);

      // kiểm tra xem user có tồn tại hay không
      const userOrError = await firstValueFrom(this.authClient.send('get_user_profile', { userId: userId})); 
      // chưa handle trường hợp không có user

      // nếu trong review có ảnh thì upload ảnh lên storage

      

      const imageUrls = await Promise.all(payload.request.images.map(async (image) => {
        return await this.storageService.uploadFileToStorage(image, 
          STORAGE_PATH.UserReview,
          `review-image-${userIdOrError.toString()}-${image.filename}-${uuidv1()}`,
        );
      }));

      // if any imageurl is left then return error and don't create review
      if (imageUrls.some(imageUrl => imageUrl.isLeft())) {
         return left(new AppErrors.UnexpectedError("Can not upload all image to storage."));
      }

      const reviewOrError = Review.create({
        userId: UserId.create(userIdOrError),
        place_id: request.place_id,
        title: request.title,
        description: request.description,
        rating: request.rating,
        imageURLs: [],
        likes: [],
        comments: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        isDeleted: false,
      });

      if (reviewOrError.isFailure) {
        return left(new AppErrors.UnexpectedError("Can not create Review for unknown reason"));
      }

      const result = await this.reviewService.createReview(reviewOrError.getValue());

      Logger.log(result);
      return right(Result.ok<any>());
    } catch (err) {
      Logger.error(err, err.stack);
      // RPC Exception
      if (err.status === 404) {
        return left(new AppErrors.EntityNotFoundError('User'));
      }
      return left(new AppErrors.UnexpectedError(err));
    }
  };
}
