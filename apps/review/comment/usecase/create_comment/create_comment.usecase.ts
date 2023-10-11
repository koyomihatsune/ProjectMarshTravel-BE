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
import { CreateCommentDTO } from './create_comment.dto';
import { AUTH_SERVICE, DESTINATION_SERVICE } from '@app/common/global/services';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { UserId } from 'apps/auth/user/domain/user_id';
import { StorageService } from '@app/common/storage/storage.service';
import { ERROR_CODE, STORAGE_PATH } from '@app/common/constants';
import { v1 as uuidv1 } from 'uuid';
import * as ReviewErrors from '../../../src/usecase/errors/review.errors';
import { ReviewService } from 'apps/review/src/review.service';
import { ReviewId } from 'apps/review/src/entity/review_id';
import { Comment } from '../../entity/comment.entity';
import { CommentId } from '../../entity/comment_id';
import { CommentService } from '../../comment.service';
import * as CommentUseCaseError from '../errors/comment.errors';

/* eslint-disable prettier/prettier */
type Response = Either<
  AppErrors.EntityNotFoundError | AppErrors.InvalidPayloadError | CommentUseCaseError.CommentIsAlreadyChild,
  Result<void>
>;

type CreateCommentDTOWithUserId = {
    userId: string;
    request: CreateCommentDTO;
}

@Injectable()
export class CreateCommentUseCase implements UseCase<CreateCommentDTOWithUserId, Promise<Response>>
{
  constructor(
    private readonly commentService: CommentService,
    private readonly reviewService: ReviewService,
    private readonly storageService: StorageService,
    @Inject(AUTH_SERVICE) private readonly authClient: ClientProxy,
    @Inject(DESTINATION_SERVICE) private readonly destinationClient: ClientProxy,
  ) {}

  execute = async (payload: CreateCommentDTOWithUserId): Promise<Response> => {
    try {
      const { userId, request } = payload;
      const userIdOrError = UserId.create(new UniqueEntityID(userId));
      const reviewIdOrError = ReviewId.create(new UniqueEntityID(request.reviewId));

      // chưa handle trường hợp không có user
      const reviewOrError = this.reviewService.getReviewById(reviewIdOrError);
      if (reviewOrError === undefined) {
        return left(new AppErrors.EntityNotFoundError('Review'));
      }

      // if (request.parentCommentId) {
      //   const parentCommentOrError = await this.commentService.getCommentById(reviewIdOrError);
      //   if (parentCommentOrError === undefined) {
      //     return left(new AppErrors.EntityNotFoundError('Parent comment'));
      //   } else if (parentCommentOrError.parentCommentId) {
      //     return left(new CommentUseCaseError.CommentIsAlreadyChild);
      //   }
      // }
    
      let imageUrl : string | undefined = undefined;
      // nếu trong review có ảnh thì upload ảnh lên storage
      if (payload.request.image) {
        // Logger.log("There are images in request");
        const imageUploadResult = await this.storageService.uploadFileToStorage(
          payload.request.image, 
          STORAGE_PATH.UserReview,
          `review-comment-${reviewIdOrError.toString()}-${userIdOrError.toString()}-${uuidv1()}`
        );

        // if any imageurl is left then return error and don't create review
        if (imageUploadResult.isLeft()) {
          return left(new AppErrors.UnexpectedError("Can not upload comment image to storage."));
        } else {
          imageUrl = imageUploadResult.value;
        }
      }
      
      const commentOrError = Comment.create({
        reviewId: reviewIdOrError,
        userId: userIdOrError,
        parentCommentId: 
          // request.parentCommentId ? CommentId.create(new UniqueEntityID(request.parentCommentId)) : 
          undefined,
        content: request.content,
        imageURL: imageUrl ?? '',
        likes: [],
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      if (commentOrError.isFailure) {
        return left(new AppErrors.UnexpectedError("Can not create Comment for unknown reason"));
      }

      const result = await this.commentService.createComment(commentOrError.getValue());

      Logger.log(result);
      return right(Result.ok<any>({
        message: "Create comment successfully",
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
