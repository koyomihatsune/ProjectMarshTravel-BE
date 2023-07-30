import { NestFactory } from '@nestjs/core';
import { AuthModule } from './auth.module';
import { RmqService } from '@app/common';
import { ConfigService } from '@nestjs/config';
import registerGlobals from '@app/common/global/app.setup';

async function bootstrap() {
  const app = await NestFactory.create(AuthModule, {
    logger: console,
  });
  registerGlobals(app);
  const rmqService = app.get<RmqService>(RmqService);
  app.connectMicroservice(rmqService.getOptions('AUTH', true));
  // queue AUTH trong rabbitmq:RABBIT_MQ_AUTH_QUEUE cần noAck vì request-response based message pattern
  // giải thích trong video https://youtu.be/yuVVKB0EaOQ?t=3784
  const configService = app.get(ConfigService);
  await app.startAllMicroservices();
  await app.listen(configService.get('PORT'));
}
bootstrap();
