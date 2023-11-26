import { DatabaseModule, RmqModule } from '@app/common';
import { JwtAuthGuard } from '@app/common/auth/jwt-auth.guard';
import { AllExceptionsFilter } from '@app/common/core/infra/http/exceptions/exception.filter';
import { AUTH_SERVICE, DESTINATION_SERVICE } from '@app/common/global/services';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { AuthModule } from '@app/common/auth/auth.module';
import { ReviewController } from './review.controller';
import { StorageModule } from '@app/common/storage/storage.module';
import * as Joi from 'joi';
import { CreateReviewUseCase } from './usecase/create_review/create_review.usecase';
import { ReviewService } from './review.service';
import { ReviewRepository } from './review.repo';
import { MongooseModule } from '@nestjs/mongoose';
import { ReviewDAO, ReviewSchema } from './schemas/review.schema';
import { NestjsFormDataModule } from 'nestjs-form-data';
import { GetReviewDetailsUseCase } from './usecase/get_review_details/get_review_details.usecase';
import { UpdateReviewUseCase } from './usecase/update_review/update_review.usecase';
import { LikeCommitReviewUseCase } from './usecase/interactions/review_like_commit/review_like_commit.usecase';
import { DeleteReviewUseCase } from './usecase/delete_review/delete_review.usecase';
import { GetReviewsByPlaceIdUseCase } from './usecase/get_reviews_by_place_id/get_reviews_by_place_id.usecase';
import { GetReviewsByUserUseCase } from './usecase/get_reviews_by_user/get_reviews_by_user.usecase';
import { CommentDAO, CommentSchema } from '../comment/schema/comment.schema';
import { CreateCommentUseCase } from '../comment/usecase/create_comment/create_comment.usecase';
import { GetCommentsByReviewUseCase } from '../comment/usecase/get_comments_by_review/get_comments_by_review.usecase';
import { UpdateCommentUseCase } from '../comment/usecase/update_comment/update_comment.usecase';
import { DeleteCommentUseCase } from '../comment/usecase/delete_comment/delete_comment.usecase';
import { CommentService } from '../comment/comment.service';
import { CommentRepository } from '../comment/comment.repo';
import { LikeCommitCommentUseCase } from '../comment/usecase/comment_like_commit/comment_like_commit.usecase';
import {
  SavedReviewDAO,
  SavedReviewSchema,
} from '../saved_review/schema/saved_review.schema';
import { SavedReviewRepository } from '../saved_review/saved_review.repo';
import { SavedReviewService } from '../saved_review/saved_review.service';
import { SaveCommitReviewUseCase } from '../saved_review/usecase/review_save_commit/review_save_commit.usecase';
import { GetSavedReviewsUseCase } from '../saved_review/usecase/get_saved_reviews/get_saved_reviews.usecase';
import { GetReviewsFeedUseCase } from './usecase/get_review_feed/get_review_feed.usecase';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        PORT: Joi.number().required(),
        MONGODB_URI: Joi.string().required(),
        RABBIT_MQ_URI: Joi.string().required(),
        RABBIT_MQ_AUTH_QUEUE: Joi.string().required(),
        RABBIT_MQ_DESTINATION_QUEUE: Joi.string().required(),
        RABBIT_MQ_TRIP_QUEUE: Joi.string().required(),
        GCLOUD_SA: Joi.string().required(),
        GCLOUD_STORAGE_BUCKET_NAME: Joi.string().required(),
      }),
      ignoreEnvFile: true,
    }),
    DatabaseModule,
    AuthModule,
    RmqModule,
    NestjsFormDataModule,
    MongooseModule.forFeature([{ name: ReviewDAO.name, schema: ReviewSchema }]),
    MongooseModule.forFeature([
      { name: CommentDAO.name, schema: CommentSchema },
    ]),
    MongooseModule.forFeature([
      { name: SavedReviewDAO.name, schema: SavedReviewSchema },
    ]),
    RmqModule.register({
      name: AUTH_SERVICE,
    }),
    RmqModule.register({
      name: DESTINATION_SERVICE,
    }),
    StorageModule,
  ],
  controllers: [ReviewController],
  providers: [
    // Review providers
    ReviewService,
    ReviewRepository,
    CreateReviewUseCase,
    GetReviewDetailsUseCase,
    UpdateReviewUseCase,
    DeleteReviewUseCase,
    LikeCommitReviewUseCase,
    GetReviewsByPlaceIdUseCase,
    GetReviewsByUserUseCase,
    GetReviewsFeedUseCase,
    // Comment providers
    CommentService,
    CommentRepository,
    CreateCommentUseCase,
    GetCommentsByReviewUseCase,
    UpdateCommentUseCase,
    DeleteCommentUseCase,
    LikeCommitCommentUseCase,
    // Saved review provider
    SavedReviewRepository,
    SavedReviewService,
    SaveCommitReviewUseCase,
    GetSavedReviewsUseCase,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class ReviewModule {}
