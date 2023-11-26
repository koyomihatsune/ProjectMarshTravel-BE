import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Post,
  Req,
} from '@nestjs/common';
import { AdministrativeService } from './administrative.service';
import { JWTPayload } from 'apps/auth/src/types/type.declare';
import { ProvinceFollowCommitDTO } from '../followed_administrative/usecase/province_follow_commit/province_follow_commit.dto';
import { ProvinceFollowCommitUseCase } from '../followed_administrative/usecase/province_follow_commit/province_follow_commit.usecase';
import AppErrors from '@app/common/core/app.error';
import { GetSuggestedProvincesByUserUseCase } from '../followed_administrative/usecase/get_suggested_provinces_by_user/get_suggested_provinces_by_user.usecase';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ResponseMessage } from '@app/common/core/infra/http/decorators/response.decorator';
import { RESULT_RESPONSE_MESSAGE } from '@app/common/core/infra/http/decorators/response.constants';

@Controller('adm')
export class AdministrativeController {
  constructor(
    private readonly administrativeService: AdministrativeService,
    private readonly provinceFollowCommitUseCase: ProvinceFollowCommitUseCase,
    private readonly getSuggestedProvincesByUserUseCase: GetSuggestedProvincesByUserUseCase,
  ) {}

  @Get('province')
  async getProvinceList(@Req() req: Request & { user: JWTPayload }) {
    const result = await this.administrativeService.getProvinceList(
      req.user.sub,
    );
    return result;
  }

  @Post('province/follow')
  async followProvinceCommit(
    @Req() req: Request & { user: JWTPayload },
    @Body() body: ProvinceFollowCommitDTO,
  ) {
    const result = await this.provinceFollowCommitUseCase.execute({
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

  @Get('province/suggests')
  async getProvinceSuggestions(@Req() req: Request & { user: JWTPayload }) {
    const result = await this.getSuggestedProvincesByUserUseCase.execute({
      userId: req.user.sub,
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

  @MessagePattern('get_followed_provinces')
  @ResponseMessage(RESULT_RESPONSE_MESSAGE.CommonSuccess)
  async getFollowedProvincesRPC(@Payload() body: { userId: string }) {
    const result = await this.administrativeService.getProvinceList(
      body.userId,
    );
    const filteredResult = result.filter((province) => province.followed);
    return filteredResult;
  }
}
