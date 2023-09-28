import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ReviewModule } from './review.module';
import { ConfigService } from '@nestjs/config';
import registerGlobals from '@app/common/global/app.setup';
import { RmqService } from '@app/common';

async function bootstrap() {
  const app = await NestFactory.create(ReviewModule);
  registerGlobals(app);
  const rmqService = app.get<RmqService>(RmqService);
  app.connectMicroservice(rmqService.getOptions('REVIEW'));
  app.useGlobalPipes(new ValidationPipe());
  const configService = app.get(ConfigService);
  await app.startAllMicroservices();
  await app.listen(configService.get('PORT'));
}
bootstrap();
