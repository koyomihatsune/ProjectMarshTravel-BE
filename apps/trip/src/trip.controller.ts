import {
  BadRequestException,
  Body,
  Controller,
  NotFoundException,
  Post,
  Req,
} from '@nestjs/common';
import { CreateTripUseCase } from './usecase/trip/create_trip/create_trip.usecase';
import { CreateTripDTO } from './usecase/trip/create_trip/create_trip.dto';
import AppErrors from '@app/common/core/app.error';
import { JWTPayload } from 'apps/auth/src/types/type.declare';

@Controller('trip')
export class TripController {
  constructor(private readonly createTripUseCase: CreateTripUseCase) {}

  @Post('create')
  async createTrip(
    @Req() req: Request & { user: JWTPayload },
    @Body() body: CreateTripDTO,
  ) {
    const result = await this.createTripUseCase.execute({
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
}
