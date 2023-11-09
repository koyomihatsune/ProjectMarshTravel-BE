import { Module, DynamicModule, Provider, Type } from '@nestjs/common';
import { defaultRateLimiterOptions } from './default_options';
import {
  RateLimiterOptions,
  RateLimiterModuleAsyncOptions,
  RateLimiterOptionsFactory,
} from './rate_limiter.interface';

@Module({
  exports: ['RATE_LIMITER_OPTIONS'],
  providers: [
    { provide: 'RATE_LIMITER_OPTIONS', useValue: defaultRateLimiterOptions },
  ],
})
export class RateLimiterModule {
  static register(
    options: RateLimiterOptions = defaultRateLimiterOptions,
  ): DynamicModule {
    return {
      module: RateLimiterModule,
      providers: [{ provide: 'RATE_LIMITER_OPTIONS', useValue: options }],
    };
  }

  static registerAsync(options: RateLimiterModuleAsyncOptions): DynamicModule {
    return {
      module: RateLimiterModule,
      imports: options.imports,
      providers: [
        ...this.createAsyncProviders(options),
        ...(options.extraProviders || []),
      ],
    };
  }

  private static createAsyncProviders(
    options: RateLimiterModuleAsyncOptions,
  ): Provider[] {
    if (options.useExisting || options.useFactory) {
      return [this.createAsyncOptionsProvider(options)];
    }

    if (options.useClass) {
      return [
        this.createAsyncOptionsProvider(options),
        {
          provide: options.useClass,
          useClass: options.useClass,
        },
      ];
    }
    return [this.createAsyncOptionsProvider(options)];
  }

  private static createAsyncOptionsProvider(
    options: RateLimiterModuleAsyncOptions,
  ): Provider {
    if (options.useFactory) {
      return {
        provide: 'RATE_LIMITER_OPTIONS',
        useFactory: options.useFactory,
        inject: options.inject || [],
      };
    }

    const isRateLimiter = (
      item: Type<RateLimiterOptionsFactory> | undefined,
    ): item is Type<RateLimiterOptionsFactory> => {
      return !!item;
    };

    const nonNullInject = [options.useExisting, options.useClass].filter(
      isRateLimiter,
    );

    return {
      provide: 'RATE_LIMITER_OPTIONS',
      useFactory: async (optionsFactory: RateLimiterOptionsFactory) =>
        optionsFactory.createRateLimiterOptions(),
      inject: nonNullInject,
    };
  }
}
