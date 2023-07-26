import { Controller, Get } from '@nestjs/common';
import { DestinationService } from './destination.service';
import { GoogleMapsService } from './gmaps/gmaps.service';
import { RESULT_RESPONSE_MESSAGE } from '@app/common/core/infra/http/decorators/response.constants';
import { ResponseMessage } from '@app/common/core/infra/http/decorators/response.decorator';
import { GOOGLE_MAPS_API } from './constants/services';

@Controller('destination')
export class DestinationController {
  constructor(
    private readonly destinationService: DestinationService,
    private readonly googleMapsService: GoogleMapsService,
  ) {}

  @Get('hello')
  getHello(): string {
    return this.destinationService.getHello();
  }

  @Get('hello-no-auth')
  getHelloNoAuth(): string {
    return this.destinationService.getHello();
  }

  @Get('test')
  @ResponseMessage(RESULT_RESPONSE_MESSAGE.CommonSuccess)
  async findNearbyPlace() {
    return await this.googleMapsService.getMultiplePlacesFromText({
      input: 'highlands coffee',
      language: GOOGLE_MAPS_API.QUERY_PARAMS.LANGUAGE.VIETNAMESE,
      lat: 21.0561746,
      lon: 105.8219055,
      opennow: true,
    });
  }
}
