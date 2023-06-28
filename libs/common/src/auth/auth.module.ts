import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { RmqModule } from '../rmq/rmq.module';
import { AUTH_SERVICE } from './services';
import { FirebaseAuthMiddleware } from './auth.middleware';

@Module({
  imports: [RmqModule.register({ name: AUTH_SERVICE })],
  exports: [RmqModule],
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(FirebaseAuthMiddleware).forRoutes('*');
  }
}
