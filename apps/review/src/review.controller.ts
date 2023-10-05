import AppErrors from '@app/common/core/app.error';
import {
  BadRequestException,
  Body,
  Controller,
  NotFoundException,
  Post,
  Req,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JWTPayload } from 'apps/auth/src/types/type.declare';
import { CreateReviewUseCase } from './usecase/create_review/create_review.usecase';
import { CreateReviewDTO } from './usecase/create_review/create_review.dto';

@Controller('review')
export class ReviewController {
  constructor(
    private readonly createReviewUseCase: CreateReviewUseCase, // private readonly getTripListPaginationUseCase: GetTripListPaginationUseCase, // private readonly getTripDetailsUseCase: GetTripDetailsUseCase, // private readonly updateTripUseCase: UpdateTripUseCase,
  ) {}
  @Post('create')
  @UseInterceptors(FileInterceptor('review'))
  async createReview(
    @Req() req: Request & { user: JWTPayload },
    @Body() body: CreateReviewDTO,
  ) {
    const result = await this.createReviewUseCase.execute({
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
