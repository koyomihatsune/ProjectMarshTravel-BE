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
import { CreateReviewDTO } from './create_review.dto';
import { AUTH_SERVICE, DESTINATION_SERVICE } from '@app/common/global/services';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { Review } from '../../entity/review.entity';
import { UserId } from 'apps/auth/user/domain/user_id';
import { ReviewService } from '../../review.service';
import { StorageService } from '@app/common/storage/storage.service';
import { ERROR_CODE, STORAGE_PATH } from '@app/common/constants';
import { v1 as uuidv1 } from 'uuid';
import * as ReviewErrors from '../errors/review.errors';
import { UserProfileResponseDTO } from '../../../../auth/user/usecase/get_profile/get_profile.dto';
import { SingleDestinationResponseDTO } from '../../../../destination/src/dtos/destination.response.dto';

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
    @Inject(DESTINATION_SERVICE) private readonly destinationClient: ClientProxy,
  ) {}

  execute = async (payload: CreateReviewDTOWithUserId): Promise<Response> => {
    try {
      const { userId, request } = payload;
      const userIdOrError = new UniqueEntityID(userId);

      // chưa handle trường hợp không có user

      const destination: ResultRPC<SingleDestinationResponseDTO> = await firstValueFrom(this.destinationClient.send('get_destination_details', { place_id: request.place_id, language: 'vi' })); 
      if (destination.value.isFailure) {
        return left(new AppErrors.GoogleMapsError(destination.value.error));
      }

      // nếu trong review có ảnh thì upload ảnh lên storage
      let successOnlyImageUrls = [];
      if (payload.request.images) {
        // Logger.log("There are images in request");
        const imageUrls = await Promise.all(payload.request.images.map(async (image) => {
          return await this.storageService.uploadFileToStorage(image, 
            STORAGE_PATH.UserReview,
            `review-image-${userIdOrError.toString()}-${uuidv1()}`,
          );
        }));

        // if any imageurl is left then return error and don't create review
        if (imageUrls.some(imageUrl => imageUrl.isLeft())) {
          return left(new AppErrors.UnexpectedError("Can not upload all image to storage."));
        }

        // console.log(imageUrls);
        successOnlyImageUrls = imageUrls.map((imageUrl) => imageUrl.value as string);        
      }
      
      const reviewOrError = Review.create({
        userId: UserId.create(userIdOrError),
        place_id: request.place_id,
        title: request.title,
        description: request.description,
        tagging: {
          province_code: "00",
          highlighted: false,
        },
        rating: request.rating,
        imageURLs: successOnlyImageUrls,
        likes: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        isDeleted: false,
        isApproved: false,
      });

      if (reviewOrError.isFailure) {
        return left(new AppErrors.UnexpectedError("Can not create Review for unknown reason"));
      }

      const result = await this.reviewService.createReview(reviewOrError.getValue());

      Logger.log(result);
      return right(Result.ok<any>({
        message: "Create review successfully",
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
