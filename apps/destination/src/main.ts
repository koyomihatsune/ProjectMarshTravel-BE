import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DestinationModule } from './destination.module';
import { ConfigService } from '@nestjs/config';
import registerGlobals from '@app/common/global/app.setup';
import { RmqService } from '@app/common';
import { DESTINATION_SERVICE } from '@app/common/global/services';

async function bootstrap() {
  const app = await NestFactory.create(DestinationModule);
  registerGlobals(app);
  const rmqService = app.get<RmqService>(RmqService);
  app.connectMicroservice(rmqService.getOptions(DESTINATION_SERVICE, true));
  // queue DESTINATION trong rabbitmq:RABBIT_MQ_DESTINATION_QUEUE cần noAck vì request-response based message pattern
  // giải thích trong video https://youtu.be/yuVVKB0EaOQ?t=3784
  app.useGlobalPipes(new ValidationPipe());
  const configService = app.get(ConfigService);
  await app.startAllMicroservices();
  await app.listen(configService.get('PORT'));
}
bootstrap();
