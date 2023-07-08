import { Controller, Get, UseGuards } from '@nestjs/common';
import { DestinationService } from './destination.service';
import { JwtAuthGuard } from '@app/common/auth/jwt-auth.guard';

@Controller('destination')
export class DestinationController {
  constructor(private readonly destinationService: DestinationService) {}

  @Get('hello')
  @UseGuards(JwtAuthGuard)
  getHello(): string {
    return this.destinationService.getHello();
  }

  @Get('hello-no-auth')
  getHelloNoAuth(): string {
    return this.destinationService.getHello();
  }
}
