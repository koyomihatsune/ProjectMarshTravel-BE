import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TwilioService } from './twilio.service';

@Module({
  imports: [ConfigModule],
  providers: [TwilioService, ConfigService],
  exports: [TwilioService],
  controllers: [],
})
export class TwilioModule {}
