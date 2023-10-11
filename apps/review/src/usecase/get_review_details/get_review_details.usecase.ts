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
import { firstValueFrom } from 'rxjs';
import { UniqueEntityID } from '@app/common/core/domain/unique_entity_id';
import { GetReviewDetailsDTO } from './get_review_details.dto';
import { SingleDestinationResponseDTO } from 'apps/destination/src/dtos/destination.response.dto';
import { SingleReviewResponseDTO } from '../../dto/review.response.dto';
import { ReviewId } from '../../entity/review_id';
import { ReviewService } from '../../review.service';
import { UserProfileResponseDTO } from 'apps/auth/user/usecase/get_profile/get_profile.dto';
import { UserId } from 'apps/auth/user/domain/user_id';
import { CommentService } from 'apps/review/comment/comment.service';

/* eslint-disable prettier/prettier */
type Response = Either<
  AppErrors.InvalidPayloadError,
  Result<SingleReviewResponseDTO>
>;

type GetReviewDetailsWithUserIDDTO = {
    userId: string,
    request: GetReviewDetailsDTO,
}

@Injectable()
export class GetReviewDetailsUseCase
  implements UseCase<GetReviewDetailsWithUserIDDTO, Promise<Response>>
{
  constructor(
    @Inject(AUTH_SERVICE) private readonly authClient: ClientProxy,
    @Inject(DESTINATION_SERVICE) private readonly destinationClient: ClientProxy,
    private readonly reviewService: ReviewService,
    private readonly commentService: CommentService,
  ) {}

  execute = async (dto: GetReviewDetailsWithUserIDDTO): Promise<Response> => {
    try {
      const { userId, request } = dto;

      // chưa handle trường hợp không có user

      const userIdOrError = UserId.create(new UniqueEntityID(userId));
      
      const reviewIdOrError = ReviewId.create(new UniqueEntityID(request.reviewId));

      // Kiểm tra review có tồn tại hay không
      const reviewOrError = await this.reviewService.getReviewById(reviewIdOrError);

      if (reviewOrError === undefined) {
        return left(new AppErrors.EntityNotFoundError('Review'));
      }

      // const highlightCommentOrError = await this.commentService.getFirstCommentByReviewId(reviewIdOrError);

      const commentCountOrError = await this.commentService.getCommentAmountByReviewId(reviewIdOrError);

      // Lấy thông tin user của Review
      const userOrError : UserProfileResponseDTO = await firstValueFrom(this.authClient.send('get_user_profile', { userId: userId})); 
      // console.log(userOrError);

      // Lấy thông tin destination của Review      
      // console.log(destinationOrError);

      let result: SingleReviewResponseDTO = {
        id: reviewOrError.reviewId.getValue().toString(),
        user: {
          id: userOrError.id,
          name: userOrError.name,
          username: userOrError.username,
          avatar: userOrError.avatar,
        },
        destination: {
            place_id: reviewOrError.place_id,
            name: '',
            address: '',
            province_code: '',
            province_name: '',
        },
        title: reviewOrError.title,
        description: reviewOrError.description,
        rating: reviewOrError.rating,
        likes_count: reviewOrError.likes.length,
        liked: reviewOrError.likes.map((like) => {
          return like.getValue().toString()
        }).includes(userIdOrError.getValue().toString()),
        saved: false,
        comments_count: commentCountOrError,
        // Làm phần này sau khi đã thêm comments
        highlighted_comments: [],
        imageURLs: reviewOrError.imageURLs,
        createdAt: reviewOrError.createdAt,
        updatedAt: reviewOrError.updatedAt,
        isDeleted: reviewOrError.isDeleted,
        isApproved: reviewOrError.isApproved,
      };

      // Kiểm tra destination có tồn tại không. Nếu có thì thêm thông tin về place vào.
      const destinationResult : ResultRPC<SingleDestinationResponseDTO> = await firstValueFrom(this.destinationClient.send('get_destination_details', { place_id: reviewOrError.place_id, language: request.language })); 
      
      if (destinationResult.value.isSuccess) {
        const destinationOrError = destinationResult.value._value;
        result = {
          ...result,
          destination: {
            place_id: destinationOrError.place_id ,
            name:destinationOrError.name,
            address: destinationOrError.mapsFullDetails.formatted_address,
            province_code: destinationOrError.administrative.province.code ?? '',
            province_name: destinationOrError.administrative.province.name ?? '',
          },
        }
      }

      return right(Result.ok<SingleReviewResponseDTO>(result));
    } catch (err) {

      // eslint-disable-next-line no-console
      Logger.log(err, err.stack);

      return left(new AppErrors.UnexpectedError(err.toString()));
    }
  };
}
