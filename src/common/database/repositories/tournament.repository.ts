import type { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Inject, Injectable } from '@nestjs/common';
import { TournamentBetEntity } from '../../../tournaments/models/tournament-bet.entity';
import { TournamentEntity } from '../../../tournaments/models/tournament.entity';
import { FinalizeTournamentEntity } from '../../../tournaments/models/finalize-tournament.entity';
import { TournamentPlacementEntity } from '../../../tournaments/models/tournament-placement.entity';
import { TournamentPlayerScoreEntity } from '../../../tournaments/models/tournament-player-score.entity';
import { SortDirection } from '../../enums/sort-direction.enum';
import { CreateTournamentEntity } from '../../models/create-tournament.entity';
import { FindTournamentPlayerScoresEntity } from '../../models/find-tournament-player-scores.entity';
import { FindTournamentsEntity } from '../../models/find-tournaments.entity';
import { TournamentPlayerScoreAggregateModel } from '../models/tournament-player-score-aggregate.model';
import { TournamentRecordModel } from '../models/tournament-record.model';
import { IPrismaService } from '../prisma.service';

export interface ITournamentRepository {
  createTournamentAsync(entity: CreateTournamentEntity): Promise<TournamentEntity>;
  findAsync(filters?: FindTournamentsEntity): Promise<TournamentEntity[]>;
  findPlayerScoresAsync(filters: FindTournamentPlayerScoresEntity): Promise<TournamentPlayerScoreEntity[]>;
  createAssociationsAsync(entities: TournamentBetEntity[]): Promise<TournamentBetEntity[]>;
  updateFinalizedAtAsync(entity: FinalizeTournamentEntity): Promise<TournamentEntity | null>;
  createPlacementsAsync(entities: TournamentPlacementEntity[]): Promise<TournamentPlacementEntity[]>;
}

export const ITournamentRepository = Symbol('ITournamentRepository');

@Injectable()
export class TournamentRepository implements ITournamentRepository {
  constructor(
    @Inject(IPrismaService) private readonly prisma: IPrismaService,
    @InjectMapper() private readonly mapper: Mapper,
  ) {}

  async createTournamentAsync(entity: CreateTournamentEntity): Promise<TournamentEntity> {
    const tournament = await this.prisma.client.tournament.create({ data: entity });
    const result = this.mapper.map(tournament, TournamentRecordModel, TournamentEntity);
    return result;
  }

  async findAsync(filters?: FindTournamentsEntity): Promise<TournamentEntity[]> {
    const tournaments = await this.prisma.client.tournament.findMany({
      where: {
        id: filters?.id,
        name: filters?.name,
        startsAt: filters?.createdAt ? { lte: filters.createdAt } : undefined,
        endsAt: filters?.createdAt ? { gte: filters.createdAt } : undefined,
        bets: filters?.betId ? { some: { betId: filters.betId } } : undefined,
      },
      orderBy: { id: filters?.order ?? SortDirection.Asc },
    });
    const result = tournaments.map((tournament): TournamentEntity => {
      const result = this.mapper.map(tournament, TournamentRecordModel, TournamentEntity);
      return result;
    });
    return result;
  }

  async findPlayerScoresAsync(filters: FindTournamentPlayerScoresEntity): Promise<TournamentPlayerScoreEntity[]> {
    const aggregatedPlayerScores = await this.prisma.client.bet.groupBy({
      by: ['playerId'],
      where: {
        playerId: filters.playerId,
        tournaments: { some: { tournamentId: filters.tournamentId } },
      },
      _sum: { amount: true },
    });
    const result = aggregatedPlayerScores.map((playerScore): TournamentPlayerScoreEntity => {
      const result = this.mapper.map(playerScore, TournamentPlayerScoreAggregateModel, TournamentPlayerScoreEntity, {
        extraArgs: (): { tournamentId: string } => ({ tournamentId: filters.tournamentId }),
      });
      return result;
    });
    return result;
  }

  async createAssociationsAsync(entities: TournamentBetEntity[]): Promise<TournamentBetEntity[]> {
    const associations = await this.prisma.client.tournamentBet.createManyAndReturn({
      data: entities,
      skipDuplicates: true,
    });
    const result = associations.map((association): TournamentBetEntity => {
      const result: TournamentBetEntity = { tournamentId: association.tournamentId, betId: association.betId };
      return result;
    });
    return result;
  }

  async updateFinalizedAtAsync(entity: FinalizeTournamentEntity): Promise<TournamentEntity | null> {
    const tournaments = await this.prisma.client.tournament.updateManyAndReturn({
      where: { id: entity.tournamentId, finalizedAt: null },
      data: { finalizedAt: entity.finalizedAt },
    });
    const tournament = tournaments[0];
    const result = tournament ? this.mapper.map(tournament, TournamentRecordModel, TournamentEntity) : null;
    return result;
  }

  async createPlacementsAsync(entities: TournamentPlacementEntity[]): Promise<TournamentPlacementEntity[]> {
    const placements = await this.prisma.client.tournamentPlacement.createManyAndReturn({ data: entities });
    const result = placements.map((placement): TournamentPlacementEntity => {
      const result: TournamentPlacementEntity = {
        tournamentId: placement.tournamentId,
        playerId: placement.playerId,
        score: placement.score,
        rank: placement.rank,
      };
      return result;
    });
    return result;
  }
}
