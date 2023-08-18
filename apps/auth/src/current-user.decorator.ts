import { createParamDecorator, ExecutionContext, Logger } from '@nestjs/common';
import { UserDAO } from '../user/schemas/user.schema';

export const getCurrentUserByContext = (context: ExecutionContext): UserDAO => {
  if (context.getType() === 'http') {
    return context.switchToHttp().getRequest().user;
  }
  if (context.getType() === 'rpc') {
    Logger.log('user', context.switchToRpc().getData());
    return context.switchToRpc().getData().user;
  }
};

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext) =>
    getCurrentUserByContext(context),
);
