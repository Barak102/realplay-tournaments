import { Module } from '@nestjs/common';
import { IRedisService, RedisService } from './redis.service';

@Module({
  providers: [{ provide: IRedisService, useClass: RedisService }],
  exports: [IRedisService],
})
export class RedisModule {}
