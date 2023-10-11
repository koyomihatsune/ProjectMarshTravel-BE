import { AUTH_SERVICE, DESTINATION_SERVICE } from '@app/common/global/services';
import * as AppErrors from '@app/common/core/app.error';
import {
  Either,
  Result,
  ResultRPC,
  left,
  right,
} from '@app/common/core/result';
import { UseCase } from '@app/common/core/usecase';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { UniqueEntityID } from '@app/common/core/domain/unique_entity_id';
import { GetCommentsByReviewDTO } from './get_comments_by_review.dto';
import { UserId } from 'apps/auth/user/domain/user_id';
import { ReviewId } from 'apps/review/src/entity/review_id';
import { CommentService } from '../../comment.service';
import {
  MultipleCommentResponseDTO,
  SingleCommentResponseDTO,
} from '../../dtos/comment.response.dto';
import {
  MultiplePublicUserProfileResponseDTO,
  SinglePublicUserProfileResponseDTO,
} from 'apps/auth/user/usecase/get_public_profiles/get_public_profiles.dto';
import { firstValueFrom } from 'rxjs';

/* eslint-disable prettier/prettier */
type Response = Either<
  AppErrors.InvalidPayloadError,
  Result<MultipleCommentResponseDTO>
>;

type GetCommentsByReviewWithUserIDDTO = {
    userId: string,
    request: GetCommentsByReviewDTO,
}

@Injectable()
export class GetCommentsByReviewUseCase
  implements UseCase<GetCommentsByReviewWithUserIDDTO, Promise<Response>>
{
  constructor(
    @Inject(AUTH_SERVICE) private readonly authClient: ClientProxy,
    @Inject(DESTINATION_SERVICE) private readonly destinationClient: ClientProxy,
    private readonly commentService: CommentService,
  ) {}

  execute = async (dto: GetCommentsByReviewWithUserIDDTO): Promise<Response> => {
    try {
      const { userId, request } = dto;

      const userIdOrError = UserId.create(new UniqueEntityID(userId));
      const reviewIdOrError = ReviewId.create(new UniqueEntityID(request.reviewId));

      
      const queryResult = await this.commentService.getCommentsByReviewId(
        reviewIdOrError,
        request.page,
        request.limit
      )

      const userIds : string[] = [];   

      const result: MultipleCommentResponseDTO = {
        list: queryResult.result.map((comment) => {
          userIds.push(comment.userId.getValue().toString());
          const singleResult: SingleCommentResponseDTO = { 
            id: comment.commentId.getValue().toString(),
            user: {
              id: comment.userId.getValue().toString(),
              name: '',
              username: '',
              avatar: '',
            },
            content: comment.content,
            imageURL: comment.imageURL ? comment.imageURL : undefined,
            likeCount: comment.likes.length,
            liked: comment.likes.map((like) => {
            return like.getValue().toString()
            }).includes(userIdOrError.getValue().toString()),
          };
          return singleResult;
        }),
        page: queryResult.page,
        totalPage: queryResult.totalPage
      };

      const userQueryResult : ResultRPC<MultiplePublicUserProfileResponseDTO> = await firstValueFrom(this.authClient.send('get_user_profiles', { userIds: userIds }));

      // Kiểm tra destination có tồn tại không. Nếu có thì thêm thông tin về place vào.
      // Chưa handle các trường hợp lỗi

      result.list.forEach((comment) => {
        const userDetails = userQueryResult.value._value.users.find((userDetails : SinglePublicUserProfileResponseDTO) => userDetails.id === comment.user.id);

        if (userDetails === undefined) {
          Logger.log(`User ${comment.user.id} not found in query result. Left out of array`, 'GetCommentsByReviewUseCase');
          return;
        } else {
          comment.user = {
            id: userDetails.id,
            name: userDetails.name,
            username: userDetails.username,
            avatar: userDetails.avatar,
          }
        }
      });

      return right(Result.ok<MultipleCommentResponseDTO>(result));
    } catch (err) {
      // eslint-disable-next-line no-console
      Logger.log(err, err.stack);
      return left(new AppErrors.UnexpectedError(err.message));
    }
  };
}
