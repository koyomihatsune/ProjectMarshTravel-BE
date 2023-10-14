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
import { GetReviewsByUserDTO } from './get_reviews_by_user.dto';
import {
  MultipleReviewResponseDTO,
  SingleReviewResponseDTO,
} from '../../dto/review.response.dto';
import { ReviewService } from '../../review.service';
import { UserId } from 'apps/auth/user/domain/user_id';
import {
  MultipleDestinationResponseDTO,
  SingleDestinationResponseDTO,
} from 'apps/destination/src/dtos/destination.response.dto';
import { firstValueFrom } from 'rxjs';
import { MultiplePublicUserProfileResponseDTO } from '../../../../auth/user/usecase/get_public_profiles/get_public_profiles.dto';
import { SavedReviewService } from '../../../saved_review/saved_review.service';

/* eslint-disable prettier/prettier */
type Response = Either<
  AppErrors.InvalidPayloadError,
  Result<MultipleReviewResponseDTO>
>;

type GetReviewByUserWithUserIDDTO = {
    userId: string,
    request: GetReviewsByUserDTO,
}

@Injectable()
export class GetReviewsByUserUseCase
  implements UseCase<GetReviewByUserWithUserIDDTO, Promise<Response>>
{
  constructor(
    @Inject(AUTH_SERVICE) private readonly authClient: ClientProxy,
    @Inject(DESTINATION_SERVICE) private readonly destinationClient: ClientProxy,
    private readonly reviewService: ReviewService,
    private readonly savedReviewService: SavedReviewService,
  ) {}

  execute = async (dto: GetReviewByUserWithUserIDDTO): Promise<Response> => {
    try {
      const { userId, request } = dto;

      const currentUserIdOrError = UserId.create(new UniqueEntityID(userId));
      const targetUserIdOrError = UserId.create(new UniqueEntityID(request.userId));

      const targetUserResult : ResultRPC<MultiplePublicUserProfileResponseDTO> = (await firstValueFrom(this.authClient.send('get_user_profiles', { userIds: [request.userId]})));

      const targetUser = targetUserResult.value?._value?.users[0] || undefined;

      const queryResult = await this.reviewService.getReviewsByUserId(targetUserIdOrError, request.page, request.limit, request.sortBy);

      // console.log(queryResult);
            
      const placeIds : string[] = [];
      // const userIds : string[] = [];
      
      const result: MultipleReviewResponseDTO = {
        list: queryResult.result.map((reviewOrError) => {
          placeIds.push(reviewOrError.place_id);
          // userIds.push(reviewOrError.userId.getValue().toString());
          const singleResult: SingleReviewResponseDTO = {
              id: reviewOrError.reviewId.getValue().toString(),
              user: {
                id: reviewOrError.userId.getValue().toString(),
                name: '',
                username: '',
                avatar: '',
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
              }).includes(currentUserIdOrError.getValue().toString()),
              saved: false,
              comments_count: 0,
              // Làm phần này sau khi đã thêm comments
              highlighted_comments: [],
              imageURLs: reviewOrError.imageURLs,
              createdAt: reviewOrError.createdAt,
              updatedAt: reviewOrError.updatedAt,
              isDeleted: reviewOrError.isDeleted,
              isApproved: reviewOrError.isApproved,
            };
          return singleResult;
        }),
        page: queryResult.page,
        totalPage: queryResult.totalPage,
      };

      // Map các destination và user với review qua query tới 2 service tương ứng
      
      // Vì đây là get review by place id nên chỉ cần 1 placeId duy nhất
      const destinationQueryResult : MultipleDestinationResponseDTO = await firstValueFrom(this.destinationClient.send('get_multiple_destinations', { place_ids: placeIds, language: 'vi'}));     

      const savedReviewQueryResult = (await this.savedReviewService.getSavedReviewIdsByUserIdNonPagination(currentUserIdOrError)).map((savedReview) => {
        return savedReview.getValue().toString();
      });

      result.list.forEach((review) => {

        if (savedReviewQueryResult.includes(review.id)) review.saved = true;
      
        const destinationDetails = destinationQueryResult.destinations.find((destinationDetails : SingleDestinationResponseDTO) => {
          return destinationDetails.place_id === review.destination.place_id;
        });

        if (destinationDetails === undefined) {
          Logger.log(`Place ${review.destination.place_id} not found in query result. Left out of array`, 'GetTripDetailsUseCase');
        } else {
          review.destination = {
            place_id: destinationDetails.place_id,
            name: destinationDetails.name,
            address: destinationDetails.mapsFullDetails.formatted_address,
            province_code: destinationDetails.administrative?.province?.code ?? '00',
            province_name: destinationDetails.administrative?.province?.name ?? '00',
          }
        }

        if (targetUser === undefined) {
          Logger.log(`User ${review.user.id} not found in query result. Left out of array`, 'GetTripDetailsUseCase');
          return;
        } else {
          review.user = {
            id: targetUser.id,
            name: targetUser.name,
            username: targetUser.username,
            avatar: targetUser.avatar,
          }
        }
      });

      return right(Result.ok<MultipleReviewResponseDTO>(result));
    } catch (err) {
      // eslint-disable-next-line no-console
      Logger.log(err, err.stack);
      return left(new AppErrors.UnexpectedError(err.message));
    }
  };
}
