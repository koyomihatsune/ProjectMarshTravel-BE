import { NestFactory } from '@nestjs/core';
import { DestinationModule } from './destination.module';

async function bootstrap() {
  const app = await NestFactory.create(DestinationModule);
  await app.listen(3000);
}
bootstrap();
