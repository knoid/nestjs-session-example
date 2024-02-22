import { DynamicModule, Module, ModuleMetadata, Type } from '@nestjs/common';
import { SessionModule as NestJSSessionModule } from 'nestjs-session';

import { RedisStoreModule } from './redis-store.module';
import { ConditionalModule } from '@nestjs/config';

export interface SessionModuleOptions {
  secret: string[];
  redisURL: string;
}

@Module({})
export class SessionModule {
  static registerAsync(options: {
    useFactory: (...args: any[]) => SessionModuleOptions;
    imports?: ModuleMetadata['imports'];
    inject: Array<Type<any> | string>;
  }): DynamicModule {
    const RedisStoreModuleReg = RedisStoreModule.registerAsync(options);

    return {
      module: SessionModule,

      imports: [
        ...(options.imports || []),
        ConditionalModule.registerWhen(RedisStoreModuleReg, 'REDIS_URL'),
        NestJSSessionModule.forRootAsync({
          imports: [RedisStoreModuleReg, SessionModule],
          inject: [
            { token: 'REDIS_STORE', optional: true },
            'SESSION_MODULE_OPTIONS',
          ],
          useFactory: (store, moduleOptions: SessionModuleOptions) => {
            return {
              session: {
                resave: true,
                secret: moduleOptions.secret,
                store, // store should be RedisStore or undefined
              },
            };
          },
        }),
      ],

      providers: [
        {
          provide: 'SESSION_MODULE_OPTIONS',
          inject: options.inject,
          useFactory: options.useFactory,
        },
      ],
      exports: ['SESSION_MODULE_OPTIONS'],
    };
  }
}
