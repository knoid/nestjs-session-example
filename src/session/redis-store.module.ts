import { DynamicModule, Module, ModuleMetadata, Type } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import RedisStore from 'connect-redis';

import { IORedisWrapperModule } from './ioredis-wrapper.module';

interface RedisStoreModuleOptions {
  redisURL: string;
}

@Module({})
export class RedisStoreModule {
  static registerAsync(options: {
    useFactory: (...args: any[]) => RedisStoreModuleOptions;
    imports?: ModuleMetadata['imports'];
    inject?: Array<Type<any> | string>;
  }): DynamicModule {
    return {
      module: RedisStoreModule,
      imports: [
        ...(options.imports || []),
        IORedisWrapperModule.registerAsync({
          imports: [RedisStoreModule],
          inject: ['REDIS_STORE_MODULE_OPTIONS'],
          useFactory: (moduleOptions: RedisStoreModuleOptions) => moduleOptions,
        }),
      ],
      providers: [
        {
          provide: 'REDIS_STORE_MODULE_OPTIONS',
          inject: options.inject,
          useFactory: options.useFactory,
        },
        {
          provide: 'REDIS_STORE',
          inject: ['REDIS_CLIENT'],
          useFactory: (client: ClientProxy) => new RedisStore({ client }),
        },
      ],
      exports: ['REDIS_STORE', 'REDIS_STORE_MODULE_OPTIONS'],
    };
  }
}
