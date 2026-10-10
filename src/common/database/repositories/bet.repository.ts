import { Inject, Injectable } from '@nestjs/common';
import { BetEntity } from '../../../bets/models/bet.entity';
import { CreateBetEntity } from '../../models/create-bet.entity';
import type { Bet } from '../generated/client';
import { IPrismaService } from '../prisma.service';

export interface IBetRepository {
  createBetAsync(entity: CreateBetEntity): Promise<BetEntity | null>;
  findByExternalBetIdAsync(externalBetId: string): Promise<BetEntity>;
}

export const IBetRepository = Symbol('IBetRepository');

@Injectable()
export class BetRepository implements IBetRepository {
  constructor(@Inject(IPrismaService) private readonly prisma: IPrismaService) {}

  async createBetAsync(entity: CreateBetEntity): Promise<BetEntity | null> {
    const createdBets = await this.prisma.client.bet.createManyAndReturn({
      data: [entity],
      skipDuplicates: true,
    });
    const result = createdBets[0] ? this.toBetEntity(createdBets[0]) : null;
    return result;
  }

  async findByExternalBetIdAsync(externalBetId: string): Promise<BetEntity> {
    const bet = await this.prisma.client.bet.findUniqueOrThrow({ where: { externalBetId } });
    const result = this.toBetEntity(bet);
    return result;
  }

  private toBetEntity(bet: Bet): BetEntity {
    const result: BetEntity = {
      id: bet.id,
      externalBetId: bet.externalBetId,
      playerId: bet.playerId,
      amount: Number(bet.amount),
      currency: bet.currency,
      createdAt: bet.createdAt,
    };
    return result;
  }
}
