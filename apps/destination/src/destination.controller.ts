import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { RESULT_RESPONSE_MESSAGE } from '@app/common/core/infra/http/decorators/response.constants';
import { ResponseMessage } from '@app/common/core/infra/http/decorators/response.decorator';
import { SearchDestinationsUseCase } from './usecase/search_destinations/search_destinations.usecase';
import { SearchDestinationsRequestDTO } from './usecase/dtos/destination.dto';

@Controller('destination')
export class DestinationController {
  constructor(
    private readonly searchDestinationsUseCase: SearchDestinationsUseCase,
  ) {}

  @Get('search/text')
  @ResponseMessage(RESULT_RESPONSE_MESSAGE.CommonSuccess)
  async searchDestinations(@Query() query: SearchDestinationsRequestDTO) {
    const result = await this.searchDestinationsUseCase.execute(query);
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

  @Get('search/autocomplete')
  @ResponseMessage(RESULT_RESPONSE_MESSAGE.CommonSuccess)
  async searchDestinationsAutocomplete() {
    // return await this.googleMapsService.getMultiplePlacesFromText({
    //   input: 'highlands coffee',
    //   language: GOOGLE_MAPS_API.QUERY_PARAMS.LANGUAGE.VIETNAMESE,
    //   lat: 21.0561746,
    //   lon: 105.8219055,
    //   opennow: true,
    // });
  }
}
