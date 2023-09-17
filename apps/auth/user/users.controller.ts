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
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';

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

  @MessagePattern('get_user_profile') // Message pattern
  async getUserProfileByUserId(
    @Payload() body: { userId: string },
  ): Promise<any> {
    const result = await this.getUserProfileUseCase.execute({
      userId: body.userId,
    });

    if (result.isRight()) {
      const dto = result.value.getValue();
      return dto;
    }

    const error = result.value;
    switch (error.constructor) {
      // Với các hàm RPC, luôn throw RpcException, bên kia sẽ xủ lý theo dạng text
      case AppErrors.EntityNotFoundError:
        throw new RpcException(new NotFoundException());
      default:
        throw new RpcException(new BadRequestException());
    }
  }
}
