/* eslint-disable @typescript-eslint/no-unused-vars */
import * as AppErrors from '@app/common/core/app.error';
import { UniqueEntityID } from '@app/common/core/domain/unique_entity_id';
import { Either, Result, left, right } from '@app/common/core/result';
import { UseCase } from '@app/common/core/usecase';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { AUTH_SERVICE } from '@app/common/global/services';
import { ClientProxy } from '@nestjs/microservices';
import { UserId } from 'apps/auth/user/domain/user_id';
import { LikeCommitCommentDTO } from './comment_like_commit.dto';
import { ReviewId } from 'apps/review/src/entity/review_id';
import { CommentService } from '../../comment.service';
import { CommentId } from '../../entity/comment_id';

/* eslint-disable prettier/prettier */
type Response = Either<
  AppErrors.EntityNotFoundError | AppErrors.InvalidPayloadError ,
  Result<void>
>;

type LikeCommitCommentDTOWithUserId = {
    userId: string;
    request: LikeCommitCommentDTO;
}

@Injectable()
export class LikeCommitCommentUseCase implements UseCase<LikeCommitCommentDTOWithUserId, Promise<Response>>
{
  constructor(
    private readonly commentService: CommentService,
    @Inject(AUTH_SERVICE) private readonly authClient: ClientProxy,
  ) {}

  execute = async (payload: LikeCommitCommentDTOWithUserId): Promise<Response> => {
    try {
      const { userId, request } = payload;
      const userIdOrError = UserId.create(new UniqueEntityID(userId));
      
      const commentIdOrError = CommentId.create(new UniqueEntityID(request.commentId));

      const result = request.like === true ? await this.commentService.like(commentIdOrError, userIdOrError)
        : request.like === false ? await this.commentService.unlike(commentIdOrError, userIdOrError) 
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
