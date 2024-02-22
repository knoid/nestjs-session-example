import { DynamicModule, Module, ModuleMetadata, Type } from '@nestjs/common';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';

interface IORedisWrapperModuleOptions {
  redisURL: string;
}

@Module({})
export class IORedisWrapperModule {
  static registerAsync(options: {
    useFactory: (...args: any[]) => IORedisWrapperModuleOptions;
    imports?: ModuleMetadata['imports'];
    inject: Array<Type<any> | string>;
  }): DynamicModule {
    return {
      module: IORedisWrapperModule,
      imports: options.imports,
      providers: [
        {
          provide: 'IOREDIS_WRAPPER_MODULE_OPTIONS',
          inject: options.inject,
          useFactory: options.useFactory,
        },
        {
          provide: 'REDIS_CLIENT',
          inject: ['IOREDIS_WRAPPER_MODULE_OPTIONS'],
          useFactory: (moduleOptions: IORedisWrapperModuleOptions) => {
            const url = new URL(moduleOptions.redisURL);
            return ClientProxyFactory.create({
              options: {
                host: url.hostname,
                password: url.password,
                port: Number(url.port),
                username: url.username,
              },
              transport: Transport.REDIS,
            });
          },
        },
      ],
      exports: ['REDIS_CLIENT'],
    };
  }
}
