import type { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import type { BetEntity } from '../../bets/models/bet.entity';
import { ITournamentRepository } from '../../common/database/repositories/tournament.repository';
import { FindTournamentPlayerScoresEntity } from '../../common/models/find-tournament-player-scores.entity';
import { FindTournamentsEntity } from '../../common/models/find-tournaments.entity';
import { SortedSetScoreComparison } from '../../common/redis/enums/sorted-set-score-comparison.enum';
import { SortedSetEntryModel } from '../../common/redis/models/sorted-set-entry.model';
import { IRedisService } from '../../common/redis/redis.service';
import { GetLeaderboardRequestDto, GetLeaderboardResponseDto } from '../models/dto/get-leaderboard.dto';
import { LeaderboardPlayerDto } from '../models/leaderboard-player.model';
import type { TournamentEntity } from '../models/tournament.entity';
import { TournamentPlayerScoreEntity } from '../models/tournament-player-score.entity';

export interface ITournamentLeaderboardsService {
  getLeaderboardAsync(request: GetLeaderboardRequestDto): Promise<GetLeaderboardResponseDto>;
  updateLeaderboardsForAcceptedBetAsync(bet: BetEntity): Promise<void>;
  rebuildLeaderboardAsync(tournamentId: string): Promise<void>;
}

export const ITournamentLeaderboardsService = Symbol('ITournamentLeaderboardsService');

@Injectable()
export class TournamentLeaderboardsService implements ITournamentLeaderboardsService {
  private readonly logger = new Logger(TournamentLeaderboardsService.name);

  constructor(
    @Inject(ITournamentRepository) private readonly tournamentsRepository: ITournamentRepository,
    @Inject(IRedisService) private readonly redis: IRedisService,
    @InjectMapper() private readonly mapper: Mapper,
  ) {}

  async getLeaderboardAsync(request: GetLeaderboardRequestDto): Promise<GetLeaderboardResponseDto> {
    await this.getTournamentByIdAsync(request.id);
    const key = this.getLeaderboardKey(request.id);
    const start = request.offset;
    const end = request.offset + request.limit - 1;
    const entries = await this.getSortedSetRangeDescendingAsync(key, start, end);
    const players = this.mapLeaderboardPlayers(entries, request.offset);
    const result: GetLeaderboardResponseDto = { players };
    return result;
  }

  async updateLeaderboardsForAcceptedBetAsync(bet: BetEntity): Promise<void> {
    const tournamentFilters: FindTournamentsEntity = { betId: bet.id };
    const tournaments = await this.tournamentsRepository.findAsync(tournamentFilters);
    for (const tournament of tournaments) {
      await this.updateTournamentPlayerScoreAsync(tournament.id, bet.playerId);
    }
  }

  async rebuildLeaderboardAsync(tournamentId: string): Promise<void> {
    const tournament = await this.getTournamentByIdAsync(tournamentId);
    const scoreFilters: FindTournamentPlayerScoresEntity = { tournamentId: tournament.id };
    const scores = await this.tournamentsRepository.findPlayerScoresAsync(scoreFilters);
    const entries = this.mapper.mapArray(scores, TournamentPlayerScoreEntity, SortedSetEntryModel);
    const key = this.getLeaderboardKey(tournament.id);
    await this.redis.replaceSortedSetAsync(key, entries);
  }

  private async getSortedSetRangeDescendingAsync(key: string, start: number, end: number): Promise<SortedSetEntryModel[]> {
    const entries = await this.redis.getClient().zRangeWithScores(key, start, end, { REV: true });
    const result = entries.map((entry): SortedSetEntryModel => {
      const result: SortedSetEntryModel = { member: entry.value, score: entry.score };
      return result;
    });
    return result;
  }

  private mapLeaderboardPlayers(entries: SortedSetEntryModel[], offset: number): LeaderboardPlayerDto[] {
    const result = entries.map((entry, index): LeaderboardPlayerDto => {
      const rank = offset + index + 1;
      const result = this.mapper.map(entry, SortedSetEntryModel, LeaderboardPlayerDto, { extraArgs: (): { rank: number } => ({ rank }) });
      return result;
    });
    return result;
  }

  private async updateTournamentPlayerScoreAsync(tournamentId: string, playerId: string): Promise<void> {
    const scoreFilters: FindTournamentPlayerScoresEntity = { tournamentId, playerId };
    const scores = await this.tournamentsRepository.findPlayerScoresAsync(scoreFilters);
    const playerScore = scores[0];
    if (playerScore) {
      const entry = this.mapper.map(playerScore, TournamentPlayerScoreEntity, SortedSetEntryModel);
      const key = this.getLeaderboardKey(tournamentId);
      try {
        await this.updateLeaderboardScoreIfGreaterAsync(key, entry);
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        this.logger.error(`Failed to update Redis leaderboard for tournament ${tournamentId}: ${message}`);
      }
    }
  }

  private async updateLeaderboardScoreIfGreaterAsync(key: string, entry: SortedSetEntryModel): Promise<void> {
    await this.redis.addSortedSetEntryAsync(key, entry, SortedSetScoreComparison.GreaterThan);
  }

  private async getTournamentByIdAsync(tournamentId: string): Promise<TournamentEntity> {
    const filters: FindTournamentsEntity = { id: tournamentId };
    const tournaments = await this.tournamentsRepository.findAsync(filters);
    const tournament = tournaments[0];
    if (!tournament) {
      throw new NotFoundException(`Tournament ${tournamentId} was not found`);
    }
    const result = tournament;
    return result;
  }

  private getLeaderboardKey(tournamentId: string): string {
    const result = `tournament:${tournamentId}:leaderboard`;
    return result;
  }
}
