import { AsyncLocalStorage } from 'node:async_hooks';
import { Injectable, type OnModuleDestroy, type OnModuleInit } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { requiredEnv } from '../config/required-env';
import { Prisma, PrismaClient } from './generated/client';

export interface IPrismaService {
  readonly client: Prisma.TransactionClient;
  runTransactionAsync<TResult>(operationAsync: () => Promise<TResult>): Promise<TResult>;
  pingAsync(): Promise<void>;
  connectAsync(): Promise<void>;
  disconnectAsync(): Promise<void>;
}

export const IPrismaService = Symbol('IPrismaService');

@Injectable()
export class PrismaService implements IPrismaService, OnModuleInit, OnModuleDestroy {
  private readonly rootClient: PrismaClient;
  private readonly transactions = new AsyncLocalStorage<Prisma.TransactionClient>();

  constructor() {
    const adapter = new PrismaPg({ connectionString: requiredEnv('DATABASE_URL'), connectionTimeoutMillis: 5000 });
    this.rootClient = new PrismaClient({ adapter });
  }

  get client(): Prisma.TransactionClient {
    const result = this.transactions.getStore() ?? this.rootClient;
    return result;
  }

  async runTransactionAsync<TResult>(operationAsync: () => Promise<TResult>): Promise<TResult> {
    const isTransactionActive = this.client !== this.rootClient;
    let result: TResult;
    if (isTransactionActive) {
      result = await this.runWithinActiveTransactionAsync(operationAsync);
    } else {
      result = await this.runWithinNewTransactionAsync(operationAsync);
    }
    return result;
  }

  onModuleInit(): Promise<void> {
    const result = this.connectAsync();
    return result;
  }

  onModuleDestroy(): Promise<void> {
    const result = this.disconnectAsync();
    return result;
  }

  async connectAsync(): Promise<void> {
    await this.rootClient.$connect();
  }

  async pingAsync(): Promise<void> {
    await this.rootClient.$queryRaw`SELECT 1`;
  }

  async disconnectAsync(): Promise<void> {
    await this.rootClient.$disconnect();
  }

  private async runWithinActiveTransactionAsync<TResult>(operationAsync: () => Promise<TResult>): Promise<TResult> {
    const result = await operationAsync();
    return result;
  }

  private async runWithinNewTransactionAsync<TResult>(operationAsync: () => Promise<TResult>): Promise<TResult> {
    const result = await this.rootClient.$transaction(
      async (transaction: Prisma.TransactionClient): Promise<TResult> => {
        const result = await this.runInTransactionContextAsync(transaction, operationAsync);
        return result;
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted },
    );
    return result;
  }

  private async runInTransactionContextAsync<TResult>(transaction: Prisma.TransactionClient, operationAsync: () => Promise<TResult>): Promise<TResult> {
    const result = await this.transactions.run(transaction, operationAsync);
    return result;
  }
}
