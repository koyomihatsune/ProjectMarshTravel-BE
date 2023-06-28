import { Controller, Get } from '@nestjs/common';
import { DestinationService } from './destination.service';

@Controller()
export class DestinationController {
  constructor(private readonly destinationService: DestinationService) {}

  @Get()
  getHello(): string {
    return this.destinationService.getHello();
  }
}
