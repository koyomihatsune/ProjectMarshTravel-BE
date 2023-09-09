import {
  BadRequestException,
  Body,
  Controller,
  NotFoundException,
  Post,
  Put,
  Req,
} from '@nestjs/common';
import { CreateTripUseCase } from './usecase/trip/create_trip/create_trip.usecase';
import { CreateTripDTO } from './usecase/trip/create_trip/create_trip.dto';
import AppErrors from '@app/common/core/app.error';
import { JWTPayload } from 'apps/auth/src/types/type.declare';
import { CreateTripDayDTO } from './usecase/trip_day/create_trip_day/create_trip_day.dto';
import { UpdateTripDayUseCase } from './usecase/trip_day/update_trip_day/update_trip_day.usecase';
import { CreateTripDayUseCase } from './usecase/trip_day/create_trip_day/create_trip_day.usecase';
import { UpdateTripDayDTO } from './usecase/trip_day/update_trip_day/update_trip_day.dto';
import { UpdateTripUseCase } from './usecase/trip/update_trip/update_trip.usecase';
import { UpdateTripDTO } from './usecase/trip/update_trip/update_trip.dto';

@Controller('trip')
export class TripController {
  constructor(
    private readonly createTripUseCase: CreateTripUseCase,
    private readonly updateTripUseCase: UpdateTripUseCase,
    private readonly createTripDayUseCase: CreateTripDayUseCase,
    private readonly updateTripDayUseCase: UpdateTripDayUseCase,
  ) {}

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

  @Put('update')
  async updateTrip(
    @Req() req: Request & { user: JWTPayload },
    @Body() body: UpdateTripDTO,
  ) {
    const result = await this.updateTripUseCase.execute({
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

  @Post('day/create')
  async createTripDay(
    @Req() req: Request & { user: JWTPayload },
    @Body() body: CreateTripDayDTO,
  ) {
    const result = await this.createTripDayUseCase.execute({
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

  @Put('day/update')
  async updateTripDay(
    @Req() req: Request & { user: JWTPayload },
    @Body() body: UpdateTripDayDTO,
  ) {
    const result = await this.updateTripDayUseCase.execute({
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
