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
import { ReviewService } from 'apps/review/src/review.service';
import { ReviewId } from 'apps/review/src/entity/review_id';
import { SavedReviewService } from '../../saved_review.service';
import {
  MultipleReviewPreviewResponseDTO,
  MultipleReviewResponseDTO,
  SingleReviewPreviewResponseDTO,
} from '../../../src/dto/review.response.dto';
import {
  MultipleDestinationResponseDTO,
  SingleDestinationResponseDTO,
} from 'apps/destination/src/dtos/destination.response.dto';
import { GetSavedReviewsDTO } from './get_saved_reviews.dto';

/* eslint-disable prettier/prettier */
type Response = Either<
  AppErrors.EntityNotFoundError | AppErrors.InvalidPayloadError,
  Result<MultipleReviewPreviewResponseDTO>
>;

type GetSavedReviewsDTOWithUserId = {
    userId: string;
    request: GetSavedReviewsDTO;
}

@Injectable()
export class GetSavedReviewsUseCase implements UseCase<GetSavedReviewsDTOWithUserId, Promise<Response>>
{
  constructor(
    private readonly reviewService: ReviewService,
    private readonly savedReviewService: SavedReviewService,
    @Inject(AUTH_SERVICE) private readonly authClient: ClientProxy,
    @Inject(DESTINATION_SERVICE) private readonly destinationClient: ClientProxy,
  ) {}

  execute = async (payload: GetSavedReviewsDTOWithUserId): Promise<Response> => {
    try {
      const { userId , request} = payload;
      const userIdOrError = UserId.create(new UniqueEntityID(userId));

      const reviewSaveRecords = await this.savedReviewService.getSavedReviewIdsByUserIdPagination(userIdOrError, request.page, request.limit);

      const reviews = await this.reviewService.getReviewsByIds(reviewSaveRecords.result);
      
      const placeIds: string[] = []
      const result: MultipleReviewPreviewResponseDTO = {
        list: reviews.map((reviewOrError) => {
          placeIds.push(reviewOrError.place_id);
          const singleResult: SingleReviewPreviewResponseDTO = {
              id: reviewOrError.reviewId.getValue().toString(),
              title: reviewOrError.title,
              rating: reviewOrError.rating,
              firstImageURL: reviewOrError.imageURLs[0],
              destination: {
                place_id: reviewOrError.place_id,
                name: '',
              }
            };
          return singleResult;
        }),
        page: 1,
        totalPage: 1,
      };
      
      const destinationQueryResult : MultipleDestinationResponseDTO = await firstValueFrom(this.destinationClient.send('get_multiple_destinations', { place_ids: placeIds, language: 'vi'}));     

      result.list.forEach((review) => {
        const destinationDetails = destinationQueryResult.destinations.find((destinationDetails : SingleDestinationResponseDTO) => {
          return destinationDetails.place_id === review.destination.place_id;
        });

        if (destinationDetails === undefined) {
          Logger.log(`Place ${review.destination.place_id} not found in query result. Left out of array`, 'GetReviewByProvinceUseCase');
        } else {
          review.destination = {
            place_id: destinationDetails.place_id,
            name: destinationDetails.name,
          }
        }
      });

      return right(Result.ok<MultipleReviewPreviewResponseDTO>(result));
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
