import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Put,
  Req,
} from '@nestjs/common';
import AppErrors from '@app/common/core/app.error';
import { USER_RESPONSE_MESSAGES } from '@app/common/core/infra/http/decorators/response.constants';
import { ResponseMessage } from '@app/common/core/infra/http/decorators/response.decorator';
import { JWTPayload } from '../src/types/type.declare';
import { UpdateUserProfileDTO } from './usecase/update_profile/update_profile.dto';
import { UpdateUserProfileUseCase } from './usecase/update_profile/update_profile.usecase';
import { GetUserProfileUseCase } from './usecase/get_profile/get_profile.usecase';

@Controller('user')
export class UsersController {
  constructor(
    private readonly updateUserProfileUseCase: UpdateUserProfileUseCase,
    private readonly getUserProfileUseCase: GetUserProfileUseCase,
  ) {}

  @Put('profile')
  @ResponseMessage(USER_RESPONSE_MESSAGES.UserUpdated)
  async updateUserProfile(
    @Req() req: Request & { user: JWTPayload },
    @Body() updateUserProfileDTO: UpdateUserProfileDTO,
  ) {
    const result = await this.updateUserProfileUseCase.execute({
      userId: req.user.sub,
      request: updateUserProfileDTO,
    });
    // Because of using swich object.constructor, we need to check isRight first to avoid never type
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

  @Get('profile')
  @ResponseMessage(USER_RESPONSE_MESSAGES.CommonSuccess)
  async getProfile(@Req() req: Request & { user: JWTPayload }) {
    const result = await this.getUserProfileUseCase.execute({
      userId: req.user.sub,
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
