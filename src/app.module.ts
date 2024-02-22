import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SessionModule } from './session/session.module';
import { ConfigModule, ConfigService } from '@nestjs/config';

interface EnvironmentVariables {
  REDIS_URL: string;
  SESSION_SECRET: string;
}

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    SessionModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService<EnvironmentVariables>) => ({
        redisURL: configService.get('REDIS_URL'),
        secret: configService.getOrThrow('SESSION_SECRET').split(','),
      }),
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
