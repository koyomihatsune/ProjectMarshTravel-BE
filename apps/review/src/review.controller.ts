import AppErrors from '@app/common/core/app.error';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  Logger,
  MaxFileSizeValidator,
  NotFoundException,
  ParseFilePipe,
  Post,
  Put,
  Query,
  Req,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { JWTPayload } from 'apps/auth/src/types/type.declare';
import { CreateReviewUseCase } from './usecase/create_review/create_review.usecase';
import { CreateReviewDTO } from './usecase/create_review/create_review.dto';
import { GetReviewDetailsDTO } from './usecase/get_review_details/get_review_details.dto';
import { GetReviewDetailsUseCase } from './usecase/get_review_details/get_review_details.usecase';
import { UpdateReviewDTO } from './usecase/update_review/update_review.dto';
import { UpdateReviewUseCase } from './usecase/update_review/update_review.usecase';
import { LikeCommitReviewUseCase } from './usecase/interactions/review_like_commit/review_like_commit.usecase';
import { LikeCommitReviewDTO } from './usecase/interactions/review_like_commit/review_like_commit.dto';
import { DeleteReviewDTO } from './usecase/delete_review/delete_review.dto';
import { DeleteReviewUseCase } from './usecase/delete_review/delete_review.usecase';
import { GetReviewsByPlaceIdUseCase } from './usecase/get_reviews_by_place_id/get_reviews_by_place_id.usecase';
import { GetReviewsByPlaceIdDTO } from './usecase/get_reviews_by_place_id/get_reviews_by_place_id.dto';
import { GetReviewsByUserDTO } from './usecase/get_reviews_by_user/get_reviews_by_user.dto';
import { GetReviewsByUserUseCase } from './usecase/get_reviews_by_user/get_reviews_by_user.usecase';
import { CreateCommentUseCase } from '../comment/usecase/create_comment/create_comment.usecase';
import { GetCommentsByReviewUseCase } from '../comment/usecase/get_comments_by_review/get_comments_by_review.usecase';
import { UpdateCommentUseCase } from '../comment/usecase/update_comment/update_comment.usecase';
import { DeleteCommentUseCase } from '../comment/usecase/delete_comment/delete_comment.usecase';
import { CreateCommentDTO } from '../comment/usecase/create_comment/create_comment.dto';
import { GetCommentsByReviewDTO } from '../comment/usecase/get_comments_by_review/get_comments_by_review.dto';
import { UpdateCommentDTO } from '../comment/usecase/update_comment/update_comment.dto';
import { LikeCommitCommentDTO } from '../comment/usecase/comment_like_commit/comment_like_commit.dto';
import { LikeCommitCommentUseCase } from '../comment/usecase/comment_like_commit/comment_like_commit.usecase';
import { DeleteCommentDTO } from '../comment/usecase/delete_comment/delete_comment.dto';

const imageType = /jpeg|png|webp|jpg/;
@Controller('review')
export class ReviewController {
  constructor(
    private readonly createReviewUseCase: CreateReviewUseCase,
    private readonly getReviewDetailsUseCase: GetReviewDetailsUseCase,
    private readonly updateReviewUseCase: UpdateReviewUseCase,
    private readonly deleteReviewUseCase: DeleteReviewUseCase,
    private readonly likeCommitReviewUseCase: LikeCommitReviewUseCase,
    private readonly getReviewsByPlaceIdUseCase: GetReviewsByPlaceIdUseCase,
    private readonly getReviewsByUserUseCase: GetReviewsByUserUseCase,
    // Comment Service
    private readonly createCommentUseCase: CreateCommentUseCase,
    private readonly getCommentsByReviewUseCase: GetCommentsByReviewUseCase,
    private readonly updateCommentUseCase: UpdateCommentUseCase,
    private readonly likeCommitCommentUseCase: LikeCommitCommentUseCase,
    private readonly deleteCommentUseCase: DeleteCommentUseCase,
  ) {}

  @Post('create')
  @UseInterceptors(FilesInterceptor('images'))
  async createReview(
    @Req() req: Request & { user: JWTPayload },
    @Body() body: CreateReviewDTO,
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 20049000 }),
          new FileTypeValidator({ fileType: imageType }),
        ],
      }),
    )
    images?: Express.Multer.File[],
  ) {
    const result = await this.createReviewUseCase.execute({
      userId: req.user.sub,
      request: { ...body, images: images ?? [] },
    });
    if (result.isRight()) {
      const dto = result.value.getValue();
      return dto;
    }
    const error = result.value;
    switch (error.constructor) {
      case AppErrors.EntityNotFoundError:
        throw new NotFoundException(error);
      case AppErrors.GoogleMapsError:
        throw new NotFoundException(error);
      default:
        throw new BadRequestException(error);
    }
  }

  @Get('')
  async getReviewDetailsWithId(
    @Req() req: Request & { user: JWTPayload },
    @Query()
    query: GetReviewDetailsDTO,
  ) {
    const result = await this.getReviewDetailsUseCase.execute({
      userId: req.user.sub,
      request: query,
    });
    if (result.isRight()) {
      const dto = result.value.getValue();
      return dto;
    }
    const error = result.value;
    switch (error.constructor) {
      case AppErrors.EntityNotFoundError:
        throw new NotFoundException(error);
      default:
        throw new BadRequestException(error);
    }
  }

  @Put('update')
  async updateReview(
    @Req() req: Request & { user: JWTPayload },
    @Body() body: UpdateReviewDTO,
  ) {
    const result = await this.updateReviewUseCase.execute({
      userId: req.user.sub,
      request: body,
    });
    if (result.isRight()) {
      return;
    }
    const error = result.value;
    switch (error.constructor) {
      case AppErrors.EntityNotFoundError:
        throw new NotFoundException(error);
      default:
        throw new BadRequestException(error);
    }
  }

  @Put('react')
  async likeCommitReview(
    @Req() req: Request & { user: JWTPayload },
    @Body() body: LikeCommitReviewDTO,
  ) {
    const result = await this.likeCommitReviewUseCase.execute({
      userId: req.user.sub,
      request: body,
    });
    if (result.isRight()) {
      return result.value.getValue();
    }
    const error = result.value;
    switch (error.constructor) {
      case AppErrors.EntityNotFoundError:
        throw new NotFoundException(error);
      default:
        throw new BadRequestException(error);
    }
  }

  @Delete('delete')
  async deleteReview(
    @Req() req: Request & { user: JWTPayload },
    @Query() query: DeleteReviewDTO,
  ) {
    const result = await this.deleteReviewUseCase.execute({
      userId: req.user.sub,
      request: query,
    });
    if (result.isRight()) {
      return result.value.getValue();
    }
    const error = result.value;
    switch (error.constructor) {
      case AppErrors.EntityNotFoundError:
        throw new NotFoundException(error);
      default:
        throw new BadRequestException(error);
    }
  }

  @Get('multiple/p')
  async getReviewsByPlaceId(
    @Req() req: Request & { user: JWTPayload },
    @Query() query: GetReviewsByPlaceIdDTO,
  ) {
    const result = await this.getReviewsByPlaceIdUseCase.execute({
      userId: req.user.sub,
      request: query,
    });
    if (result.isRight()) {
      const dto = result.value.getValue();
      return dto;
    }
    const error = result.value;
    switch (error.constructor) {
      case AppErrors.EntityNotFoundError:
        throw new NotFoundException(error);
      default:
        throw new BadRequestException(error);
    }
  }

  @Get('multiple/u')
  async getReviewsByUser(
    @Req() req: Request & { user: JWTPayload },
    @Query() query: GetReviewsByUserDTO,
  ) {
    const result = await this.getReviewsByUserUseCase.execute({
      userId: req.user.sub,
      request: query,
    });
    if (result.isRight()) {
      const dto = result.value.getValue();
      return dto;
    }
    const error = result.value;
    switch (error.constructor) {
      case AppErrors.EntityNotFoundError:
        throw new NotFoundException(error);
      default:
        throw new BadRequestException(error);
    }
  }

  // @Post('comment/create/i')
  // @UseInterceptors(FileInterceptor('image'))
  // async createCommentWithImage(
  //   @Req() req: Request & { user: JWTPayload },
  //   @Body() body: CreateCommentDTO,
  //   @UploadedFile(
  //     new ParseFilePipe({
  //       validators: [
  //         new MaxFileSizeValidator({ maxSize: 20049000 }),
  //         new FileTypeValidator({ fileType: imageType }),
  //       ],
  //     }),
  //   )
  //   image: Express.Multer.File,
  // ) {
  //   const result = await this.createCommentUseCase.execute({
  //     userId: req.user.sub,
  //     request: {
  //       ...body,
  //       image: image ?? undefined,
  //     },
  //   });
  //   if (result.isRight()) {
  //     const dto = result.value.getValue();
  //     return dto;
  //   }
  //   const error = result.value;
  //   switch (error.constructor) {
  //     case AppErrors.EntityNotFoundError:
  //       Logger.log(error);
  //       throw new NotFoundException(error);
  //     default:
  //       Logger.log(error);
  //       throw new BadRequestException(error);
  //   }
  // }

  @Post('comment/create')
  async createComment(
    @Req() req: Request & { user: JWTPayload },
    @Body() body: CreateCommentDTO,
  ) {
    const result = await this.createCommentUseCase.execute({
      userId: req.user.sub,
      request: body,
    });
    if (result.isRight()) {
      const dto = result.value.getValue();
      return dto;
    }
    const error = result.value;
    switch (error.constructor) {
      case AppErrors.EntityNotFoundError:
        Logger.log(error);
        throw new NotFoundException(error);
      default:
        Logger.log(error);
        throw new BadRequestException(error);
    }
  }

  @Get('comment/multiple/r')
  async getCommentsByReviewId(
    @Req() req: Request & { user: JWTPayload },
    @Query() query: GetCommentsByReviewDTO,
  ) {
    const result = await this.getCommentsByReviewUseCase.execute({
      userId: req.user.sub,
      request: query,
    });
    if (result.isRight()) {
      const dto = result.value.getValue();
      return dto;
    }
    const error = result.value;
    switch (error.constructor) {
      case AppErrors.EntityNotFoundError:
        throw new NotFoundException(error);
      default:
        throw new BadRequestException(error);
    }
  }

  @Put('comment/update')
  async updateComment(
    @Req() req: Request & { user: JWTPayload },
    @Body() body: UpdateCommentDTO,
  ) {
    const result = await this.updateCommentUseCase.execute({
      userId: req.user.sub,
      request: body,
    });
    if (result.isRight()) {
      return;
    }
    const error = result.value;
    switch (error.constructor) {
      case AppErrors.EntityNotFoundError:
        throw new NotFoundException(error);
      default:
        throw new BadRequestException(error);
    }
  }

  @Put('comment/react')
  async likeCommitComment(
    @Req() req: Request & { user: JWTPayload },
    @Body() body: LikeCommitCommentDTO,
  ) {
    const result = await this.likeCommitCommentUseCase.execute({
      userId: req.user.sub,
      request: body,
    });
    if (result.isRight()) {
      return result.value.getValue();
    }
    const error = result.value;
    switch (error.constructor) {
      case AppErrors.EntityNotFoundError:
        throw new NotFoundException(error);
      default:
        throw new BadRequestException(error);
    }
  }

  @Delete('comment/delete')
  async deleteComment(
    @Req() req: Request & { user: JWTPayload },
    @Query() query: DeleteCommentDTO,
  ) {
    const result = await this.deleteCommentUseCase.execute({
      userId: req.user.sub,
      request: query,
    });
    if (result.isRight()) {
      return result.value.getValue();
    }
    const error = result.value;
    switch (error.constructor) {
      case AppErrors.EntityNotFoundError:
        throw new NotFoundException(error);
      default:
        throw new BadRequestException(error);
    }
  }
}
