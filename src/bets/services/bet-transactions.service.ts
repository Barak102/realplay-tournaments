import type { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Inject, Injectable } from '@nestjs/common';
import { CreateBetEntity } from '../../common/models/create-bet.entity';
import { FindTournamentsEntity } from '../../common/models/find-tournaments.entity';
import { IPrismaService } from '../../common/database/prisma.service';
import { IBetRepository } from '../../common/database/repositories/bet.repository';
import { ITournamentRepository } from '../../common/database/repositories/tournament.repository';
import { TournamentBetEntity } from '../../tournaments/models/tournament-bet.entity';
import { TournamentEntity } from '../../tournaments/models/tournament.entity';
import { BetEntity } from '../models/bet.entity';
import { CreateBetRequestDto } from '../models/dto/create-bet.dto';

export interface IBetTransactionsService {
  createBetAsync(request: CreateBetRequestDto): Promise<BetEntity>;
}

export const IBetTransactionsService = Symbol('IBetTransactionsService');

@Injectable()
export class BetTransactionsService implements IBetTransactionsService {
  constructor(
    @Inject(IPrismaService) private readonly prisma: IPrismaService,
    @Inject(IBetRepository) private readonly betsRepository: IBetRepository,
    @Inject(ITournamentRepository) private readonly tournamentsRepository: ITournamentRepository,
    @InjectMapper() private readonly mapper: Mapper,
  ) {}

  async createBetAsync(request: CreateBetRequestDto): Promise<BetEntity> {
    const result = await this.prisma.runTransactionAsync(async (): Promise<BetEntity> => {
      const bet = await this.createBetIfNotExistsAsync(request);
      const filters = this.mapper.map(bet, BetEntity, FindTournamentsEntity);
      const matchingTournaments = await this.tournamentsRepository.findAsync(filters);
      if (matchingTournaments.length > 0) {
        await this.assignBetToTournamentAsync(bet, matchingTournaments);
      }
      const result = bet;
      return result;
    });
    return result;
  }

  private async createBetIfNotExistsAsync(request: CreateBetRequestDto): Promise<BetEntity> {
    const entity = this.mapper.map(request, CreateBetRequestDto, CreateBetEntity);
    const insertedBet = await this.betsRepository.createBetAsync(entity);
    const result = insertedBet ?? (await this.betsRepository.findByExternalBetIdAsync(request.externalBetId));
    return result;
  }

  private async assignBetToTournamentAsync(bet: BetEntity, matchingTournaments: TournamentEntity[]): Promise<void> {
    const entities = this.mapper.mapArray(matchingTournaments, TournamentEntity, TournamentBetEntity, { extraArgs: (): { betId: string } => ({ betId: bet.id }) });
    await this.tournamentsRepository.createAssociationsAsync(entities);
  }
}
