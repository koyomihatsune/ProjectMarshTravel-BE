import { Module } from '@nestjs/common';
import { DestinationController } from './destination.controller';
import { DestinationService } from './destination.service';

@Module({
  imports: [],
  controllers: [DestinationController],
  providers: [DestinationService],
})
export class DestinationModule {}
