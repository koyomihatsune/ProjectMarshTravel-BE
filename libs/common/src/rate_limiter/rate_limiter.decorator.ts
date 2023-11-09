import { SetMetadata } from '@nestjs/common';
import { RateLimiterOptions } from './rate_limiter.interface';

export const RateLimit = (options: RateLimiterOptions): MethodDecorator =>
  SetMetadata('rateLimit', options);

export const BYPASS_RATE_LIMITER_GUARD = 'bypassRateLimiterGuard';
export const BypassRateLimiterGuard = () =>
  SetMetadata(BYPASS_RATE_LIMITER_GUARD, true);
