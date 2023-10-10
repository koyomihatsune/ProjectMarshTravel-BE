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
import { GetReviewsByProvinceDTO } from './get_reviews_by_province';
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
import {
  MultiplePublicUserProfileResponseDTO,
  SinglePublicUserProfileResponseDTO,
} from '../../../../auth/user/usecase/get_public_profiles/get_public_profiles.dto';

/* eslint-disable prettier/prettier */
type Response = Either<
  AppErrors.InvalidPayloadError,
  Result<MultipleReviewResponseDTO>
>;

type GetReviewByProvinceWithUserIDDTO = {
    userId: string,
    request: GetReviewsByProvinceDTO,
}

@Injectable()
export class GetReviewsByProvinceUseCase
  implements UseCase<GetReviewByProvinceWithUserIDDTO, Promise<Response>>
{
  constructor(
    @Inject(AUTH_SERVICE) private readonly authClient: ClientProxy,
    @Inject(DESTINATION_SERVICE) private readonly destinationClient: ClientProxy,
    private readonly reviewService: ReviewService,
  ) {}

  execute = async (dto: GetReviewByProvinceWithUserIDDTO): Promise<Response> => {
    try {
      const { userId, request } = dto;

      const userIdOrError = UserId.create(new UniqueEntityID(userId));

      // Kiểm tra xem province đó có valid không. Không thì trả về lỗi.

      const queryResult = await this.reviewService.getReviewsByProvince(request.province_code, request.page, request.limit, request.sortBy);   
      
      const placeIds = [];
      const userIds = [];
      
      const result: MultipleReviewResponseDTO = {
        reviews: queryResult.map((reviewOrError) => {
          placeIds.push(reviewOrError.place_id);
          userIds.push(reviewOrError.userId.getValue().toString());
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
              }).includes(userIdOrError.getValue().toString()),
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
        })
      };

      // Map các destination và user với review qua query tới 2 service tương ứng
      
      const destinationQueryResult : MultipleDestinationResponseDTO = await firstValueFrom(this.destinationClient.send('get_multiple_destinations', { place_ids: placeIds, language: 'vi'}));     

      const userQueryResult : ResultRPC<MultiplePublicUserProfileResponseDTO> = await firstValueFrom(this.authClient.send('get_user_profiles', { userIds: userIds }));

      // Kiểm tra destination có tồn tại không. Nếu có thì thêm thông tin về place vào.
      // Chưa handle các trường hợp lỗi

      result.reviews.forEach((review) => {
        const destinationDetails = destinationQueryResult.destinations.find((destinationDetails : SingleDestinationResponseDTO) => {
          return destinationDetails.place_id === review.destination.place_id;
        });

        if (destinationDetails === undefined) {
          Logger.log(`Place ${review.destination.place_id} not found in query result. Left out of array`, 'GetReviewByProvinceUseCase');
        } else {
          review.destination = {
            place_id: destinationDetails.place_id,
            name: destinationDetails.name,
            address: destinationDetails.mapsFullDetails.formatted_address,
            province_code: destinationDetails.administrative?.province?.code ?? '00',
            province_name: destinationDetails.administrative?.province?.name ?? '00',
          }
        }

        const userDetails = userQueryResult.value._value.users.find((userDetails : SinglePublicUserProfileResponseDTO) => userDetails.id === review.user.id);

        if (userDetails === undefined) {
          Logger.log(`User ${review.user.id} not found in query result. Left out of array`, 'GetReviewByProvinceUseCase');
          return;
        } else {
          review.user = {
            id: userDetails.id,
            name: userDetails.name,
            username: userDetails.username,
            avatar: userDetails.avatar,
          }
        }
      });

      return right(Result.ok<MultipleReviewResponseDTO>(result));
    } catch (err) {
      // eslint-disable-next-line no-console
      Logger.log(err, err.stack);
      return left(new AppErrors.UnexpectedError(err.toString()));
    }
  };
}
