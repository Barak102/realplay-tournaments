import { Injectable, Logger, type OnModuleDestroy, type OnModuleInit } from '@nestjs/common';
import { createClient } from 'redis';
import { requiredEnv } from '../config/required-env';
import { SortedSetScoreComparison } from './enums/sorted-set-score-comparison.enum';
import type { RedisClient } from './models/redis-client.model';
import { SortedSetEntryModel } from './models/sorted-set-entry.model';

export interface IRedisService {
  getClient(): RedisClient;
  addSortedSetEntryAsync(key: string, entry: SortedSetEntryModel, comparison?: SortedSetScoreComparison): Promise<void>;
  replaceSortedSetAsync(key: string, entries: SortedSetEntryModel[]): Promise<void>;
  pingAsync(): Promise<void>;
  connectAsync(): Promise<void>;
  disconnectAsync(): Promise<void>;
}

export const IRedisService = Symbol('IRedisService');

@Injectable()
export class RedisService implements IRedisService, OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private readonly client: RedisClient;

  constructor() {
    this.client = createClient({
      url: requiredEnv('REDIS_URL'),
      socket: {
        connectTimeout: 5000,
        reconnectStrategy: (retries: number): number | Error => {
          const result = retries >= 3 ? new Error('Redis connection failed after 3 retries') : 100 * (retries + 1);
          return result;
        },
      },
    });
    this.client.on('error', (error: Error): void => {
      this.logger.error(error.message);
    });
  }

  onModuleInit(): Promise<void> {
    const result = this.connectAsync();
    return result;
  }

  onModuleDestroy(): Promise<void> {
    const result = this.disconnectAsync();
    return result;
  }

  getClient(): RedisClient {
    const result = this.client;
    return result;
  }

  async addSortedSetEntryAsync(key: string, entry: SortedSetEntryModel, comparison?: SortedSetScoreComparison): Promise<void> {
    await this.client.zAdd(key, { value: entry.member, score: entry.score }, { comparison });
  }

  async replaceSortedSetAsync(key: string, entries: SortedSetEntryModel[]): Promise<void> {
    const redisEntries = entries.map((entry): { value: string; score: number } => {
      const result = { value: entry.member, score: entry.score };
      return result;
    });
    const transaction = this.client.multi().del(key);
    if (redisEntries.length > 0) {
      transaction.zAdd(key, redisEntries);
    }
    await transaction.exec();
  }

  async connectAsync(): Promise<void> {
    if (!this.client.isOpen) {
      await this.client.connect();
    }
  }

  async pingAsync(): Promise<void> {
    await this.client.ping();
  }

  async disconnectAsync(): Promise<void> {
    if (this.client.isReady) {
      await this.client.close();
    } else if (this.client.isOpen) {
      this.client.destroy();
    }
  }
}
