/* eslint-disable @typescript-eslint/no-unused-vars */
import * as AppErrors from '@app/common/core/app.error';
import { UniqueEntityID } from '@app/common/core/domain/unique_entity_id';
import { Either, Result, left, right } from '@app/common/core/result';
import { UseCase } from '@app/common/core/usecase';
import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DeleteCommentDTO } from './delete_comment.dto';
import { AUTH_SERVICE, DESTINATION_SERVICE } from '@app/common/global/services';
import { ClientProxy } from '@nestjs/microservices';
import { UserId } from 'apps/auth/user/domain/user_id';
import { CommentId } from '../../entity/comment_id';
import { CommentService } from '../../comment.service';
import * as CommentErrors from '../errors/comment.errors';

/* eslint-disable prettier/prettier */
type Response = Either<
  AppErrors.EntityNotFoundError | AppErrors.InvalidPayloadError | CommentErrors.CommentIsAlreadyChild,
  Result<void>
>;

type DeleteCommentDTOWithUserId = {
    userId: string;
    request: DeleteCommentDTO;
}

@Injectable()
export class DeleteCommentUseCase implements UseCase<DeleteCommentDTOWithUserId, Promise<Response>>
{
  constructor(
    private readonly commentService: CommentService,
    @Inject(AUTH_SERVICE) private readonly authClient: ClientProxy,
    @Inject(DESTINATION_SERVICE) private readonly destinationClient: ClientProxy,
  ) {}

  execute = async (payload: DeleteCommentDTOWithUserId): Promise<Response> => {
    try {
      const { userId, request } = payload;
      const userIdOrError = UserId.create(new UniqueEntityID(userId));
      const commentIdOrError = CommentId.create(new UniqueEntityID(request.commentId));
      
      const commentOrError = await this.commentService.getCommentById(commentIdOrError);
      if (commentOrError === undefined) {
        return left(new AppErrors.EntityNotFoundError('Comment'));
      }

      if (commentOrError.userId.getValue().toString() !== userId) {
        return left(new CommentErrors.CommentDoesNotBelongToUser());
      }

      commentOrError.isDeleted = true;
      commentOrError.updatedAt = new Date();

      const result = await this.commentService.updateComment(commentOrError);
      return right(Result.ok<any>({
        message: "Delete comment successfully",
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
