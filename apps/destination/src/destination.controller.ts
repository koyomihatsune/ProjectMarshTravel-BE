import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { RESULT_RESPONSE_MESSAGE } from '@app/common/core/infra/http/decorators/response.constants';
import { ResponseMessage } from '@app/common/core/infra/http/decorators/response.decorator';
import { SearchDestinationsUseCase } from './usecase/search_destinations/search_destinations.usecase';
import {
  GetDestinationDetailsRequestDTO,
  GetMultipleDestinationDetailsRequestDTO,
  SearchDestinationsRequestDTO,
} from './dtos/destinaiton.request.dto';
import { GetDestinationDetailsUseCase } from './usecase/get_destination_details/get_destination_details.usecase';
import { GetMultipleDestinationDetailsUseCase } from './usecase/get_multiple_destination_details/get_multiple_destination_details.usecase';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';

@Controller('destination')
export class DestinationController {
  constructor(
    private readonly searchDestinationsUseCase: SearchDestinationsUseCase,
    private readonly getDestinationDetailsUseCase: GetDestinationDetailsUseCase,
    private readonly getMultipleDestinationDetailsUseCase: GetMultipleDestinationDetailsUseCase,
  ) {}

  @Get('search/text')
  @ResponseMessage(RESULT_RESPONSE_MESSAGE.CommonSuccess)
  async searchDestinations(@Query() query: SearchDestinationsRequestDTO) {
    console.log("test");
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

  @Get('get')
  @ResponseMessage(RESULT_RESPONSE_MESSAGE.CommonSuccess)
  async getDestinationDetails(@Query() query: GetDestinationDetailsRequestDTO) {
    const result = await this.getDestinationDetailsUseCase.execute(query);
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

  @Get('get/multiple')
  @ResponseMessage(RESULT_RESPONSE_MESSAGE.CommonSuccess)
  async getMultipleDestinationsDetails(
    @Query() query: GetMultipleDestinationDetailsRequestDTO,
  ) {
    const result = await this.getMultipleDestinationDetailsUseCase.execute(
      query,
    );
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

  @MessagePattern('get_multiple_destinations')
  @ResponseMessage(RESULT_RESPONSE_MESSAGE.CommonSuccess)
  async getMultipleDestinationsDetailsRPC(
    @Payload() data: GetMultipleDestinationDetailsRequestDTO,
  ) {
    const result = await this.getMultipleDestinationDetailsUseCase.execute(
      data,
    );
    if (result.isRight()) {
      const dto = result.value.getValue();
      return dto;
    }
    const error = result.value;
    switch (error.constructor) {
      default:
        throw new RpcException(new BadRequestException(error.getErrorValue()));
    }
  }

  @MessagePattern('get_destination_details')
  @ResponseMessage(RESULT_RESPONSE_MESSAGE.CommonSuccess)
  async getDestinationDetailsRPC(
    @Payload() data: GetDestinationDetailsRequestDTO,
  ) {
    const result = await this.getDestinationDetailsUseCase.execute(data);
    return result;
    // if (result.isRight()) {
    //   const dto = result.value.getValue();
    //   return dto;
    // }
    // const error = result.value;
    // switch (error.constructor) {
    //   default:
    //     throw new RpcException(new BadRequestException(error.getErrorValue()));
    // }
  }

  // Bỏ api này
  // @Get('search/autocomplete')
  // @ResponseMessage(RESULT_RESPONSE_MESSAGE.CommonSuccess)
  // async searchDestinationsAutocomplete() {
  //   // return await this.googleMapsService.getMultiplePlacesFromText({
  //   //   input: 'highlands coffee',
  //   //   language: GOOGLE_MAPS_API.QUERY_PARAMS.LANGUAGE.VIETNAMESE,
  //   //   lat: 21.0561746,
  //   //   lon: 105.8219055,
  //   //   opennow: true,
  //   // });
  // }
}
