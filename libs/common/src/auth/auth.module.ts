import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { RmqModule } from '../rmq/rmq.module';
import { AUTH_SERVICE } from './services';

@Module({
  imports: [RmqModule.register({ name: AUTH_SERVICE })],
  exports: [RmqModule],
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply((req: Request, res: Response, next: NextFunction) => {
        const bearerToken = req.headers.authorization?.replace('Bearer ', '');
        req.headers.authorization = bearerToken
          ? `Bearer ${bearerToken}`
          : null;
        next();
      })
      .forRoutes('*');
  }
}
