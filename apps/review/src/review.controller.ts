import { Controller } from '@nestjs/common';

@Controller('review')
export class ReviewController {
  // @Post('create')
  // async createTrip(
  //   @Req() req: Request & { user: JWTPayload },
  //   @Body() body: CreateTripDTO,
  // ) {
  //   const result = await this.createTripUseCase.execute({
  //     userId: req.user.sub,
  //     request: body,
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
