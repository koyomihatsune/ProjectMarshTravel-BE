import { ConfigModule } from '@nestjs/config';
import { GoogleMapsService } from './gmaps.service';
import { Module } from '@nestjs/common';

@Module({
  imports: [ConfigModule],
  controllers: [],
  providers: [GoogleMapsService],
  exports: [GoogleMapsService],
})
export class GoogleMapsModule {}
