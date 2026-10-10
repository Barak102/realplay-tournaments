import { Inject, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { IPrismaService } from '../../common/database/prisma.service';
import { IRedisService } from '../../common/redis/redis.service';
import { HealthStatus } from '../enums/health-status.enum';
import { GetHealthResponseDto } from '../models/dto/get-health.dto';

export interface IHealthService {
  getHealthAsync(): Promise<GetHealthResponseDto>;
}

export const IHealthService = Symbol('IHealthService');

@Injectable()
export class HealthService implements IHealthService {
  constructor(
    @Inject(IPrismaService) private readonly prismaService: IPrismaService,
    @Inject(IRedisService) private readonly redisService: IRedisService,
  ) {}

  async getHealthAsync(): Promise<GetHealthResponseDto> {
    let result: GetHealthResponseDto;
    try {
      await this.checkDependenciesAsync();
      result = { status: HealthStatus.Ready };
    } catch {
      throw new ServiceUnavailableException('A required dependency is unavailable');
    }
    return result;
  }

  private async checkDependenciesAsync(): Promise<void> {
    await Promise.all([this.prismaService.pingAsync(), this.redisService.pingAsync()]);
  }
}
