import AppErrors from '@app/common/core/app.error';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
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
import { LikeCommitReviewUseCase } from './usecase/interactions/like_commit/like_commit.usecase';
import { LikeCommitReviewDTO } from './usecase/interactions/like_commit/like_commit.dto';
import { DeleteReviewDTO } from './usecase/delete_review/delete_review.dto';
import { DeleteReviewUseCase } from './usecase/delete_review/delete_review.usecase';
import { GetReviewsByPlaceIdUseCase } from './usecase/get_reviews_by_place_id/get_reviews_by_place_id.usecase';
import { GetReviewsByPlaceIdDTO } from './usecase/get_reviews_by_place_id/get_reviews_by_place_id.dto';
import { GetReviewsByUserDTO } from './usecase/get_reviews_by_user/get_reviews_by_user.dto';
import { GetReviewsByUserUseCase } from './usecase/get_reviews_by_user/get_reviews_by_user.usecase';

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
    @Body() body: DeleteReviewDTO,
  ) {
    const result = await this.deleteReviewUseCase.execute({
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

  // @Get('all')
  // async getTripList(
  //   @Req() req: Request & { user: JWTPayload },
  //   @Query() query: { page: number; limit: number },
  // ) {
  //   const result = await this.getTripListPaginationUseCase.execute({
  //     userId: req.user.sub,
  //     page: query.page,
  //     limit: query.limit,
  //   });
  //   if (result.isRight()) {
  //     const dto = result.value.getValue();
  //     return dto;
  //   }
  //   const error = result.value;
  //   switch (error.constructor) {
  //     case AppErrors.EntityNotFoundError:
  //       throw new NotFoundException(error);
  //     default:
  //       throw new BadRequestException(error);
  //   }
  // }
  //
  // @Get('')
  // async getTripDetailsWithId(
  //   @Req() req: Request & { user: JWTPayload },
  //   @Query()
  //   query: GetTripDetailsDTO,
  // ) {
  //   const result = await this.getTripDetailsUseCase.execute({
  //     userId: req.user.sub,
  //     request: query,
  //   });
  //   if (result.isRight()) {
  //     const dto = result.value.getValue();
  //     return dto;
  //   }
  //   const error = result.value;
  //   switch (error.constructor) {
  //     case AppErrors.EntityNotFoundError:
  //       throw new NotFoundException(error);
  //     default:
  //       throw new BadRequestException(error);
  //   }
  // }
  //
  // @Put('update')
  // async updateTrip(
  //   @Req() req: Request & { user: JWTPayload },
  //   @Body() body: UpdateTripDTO,
  // ) {
  //   const result = await this.updateTripUseCase.execute({
  //     userId: req.user.sub,
  //     request: body,
  //   });
  //   if (result.isRight()) {
  //     return;
  //   }
  //   const error = result.value;
  //   switch (error.constructor) {
  //     case AppErrors.EntityNotFoundError:
  //       throw new NotFoundException(error);
  //     default:
  //       throw new BadRequestException(error);
  //   }
  // }
}
