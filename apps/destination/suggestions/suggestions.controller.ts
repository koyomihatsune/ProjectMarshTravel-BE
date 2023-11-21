import {
  BadRequestException,
  Controller,
  Get,
  Query,
  Req,
} from '@nestjs/common';
import { GetSuggestionsBasedOnProvinceUseCase } from './usecase/get_suggestions_based_on_province/get_suggestions_based_on_province.usecase';
import { ResponseMessage } from '@app/common/core/infra/http/decorators/response.decorator';
import { RESULT_RESPONSE_MESSAGE } from '@app/common/core/infra/http/decorators/response.constants';
import { GetSuggestionsBasedOnProvinceDTO } from './usecase/get_suggestions_based_on_province/get_suggestions_based_on_province.dto.ts';
import { GetSuggestionsBasedOnCurrentLocationDTO } from './usecase/get_suggestions_based_on_current_location /get_suggestions_based_on_current_location .dto.ts';
import { GetSuggestionsBasedOnCurrentLocationUseCase } from './usecase/get_suggestions_based_on_current_location /get_suggestions_based_on_current_location .usecase';
import { JWTPayload } from 'apps/auth/src/types/type.declare';

@Controller('explorer')
export class SuggestionsController {
  constructor(
    private readonly getSuggestionsBasedOnProvinceUseCase: GetSuggestionsBasedOnProvinceUseCase,
    private readonly getSuggestionsBasedOnCurrentLocationUseCase: GetSuggestionsBasedOnCurrentLocationUseCase,
  ) {}

  @Get('province')
  @ResponseMessage(RESULT_RESPONSE_MESSAGE.CommonSuccess)
  async getSuggestionsBasedOnProvince(
    @Req() req: Request & { user: JWTPayload },
    @Query() query: GetSuggestionsBasedOnProvinceDTO,
  ) {
    const result = await this.getSuggestionsBasedOnProvinceUseCase.execute({
      request: query,
      userId: req.user.sub,
    });
    if (result.isRight()) {
      const dto = result.value.getValue();
      return dto;
    }
    const error = result.value;
    switch (error.constructor) {
      default:
        throw new BadRequestException(error.getErrorValue());
    }
  }

  @Get('current')
  @ResponseMessage(RESULT_RESPONSE_MESSAGE.CommonSuccess)
  async getSuggestionsBasedOnCurrentPlace(
    @Query() query: GetSuggestionsBasedOnCurrentLocationDTO,
  ) {
    const result =
      await this.getSuggestionsBasedOnCurrentLocationUseCase.execute(query);
    if (result.isRight()) {
      const dto = result.value.getValue();
      return dto;
    }
    const error = result.value;
    switch (error.constructor) {
      default:
        throw new BadRequestException(error.getErrorValue());
    }
  }
}
