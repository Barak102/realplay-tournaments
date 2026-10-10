import type { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Inject, Injectable } from '@nestjs/common';
import { FindTournamentPlayerScoresEntity } from '../../common/models/find-tournament-player-scores.entity';
import { FindTournamentsEntity } from '../../common/models/find-tournaments.entity';
import { IPrismaService } from '../../common/database/prisma.service';
import { ITournamentRepository } from '../../common/database/repositories/tournament.repository';
import { FinalizeTournamentEntity } from '../models/finalize-tournament.entity';
import { TournamentEntity } from '../models/tournament.entity';
import { TournamentPlacementEntity } from '../models/tournament-placement.entity';
import { TournamentPlayerScoreEntity } from '../models/tournament-player-score.entity';

export interface ITournamentFinalizationService {
  finalizeTournamentAsync(tournamentId: string): Promise<void>;
}

export const ITournamentFinalizationService = Symbol('ITournamentFinalizationService');

@Injectable()
export class TournamentFinalizationService implements ITournamentFinalizationService {
  constructor(
    @Inject(IPrismaService) private readonly prisma: IPrismaService,
    @Inject(ITournamentRepository) private readonly tournamentsRepository: ITournamentRepository,
    @InjectMapper() private readonly mapper: Mapper,
  ) {}

  async finalizeTournamentAsync(tournamentId: string): Promise<void> {
    await this.prisma.runTransactionAsync(async (): Promise<void> => {
      await this.createTournamentFinalSnapshotAsync(tournamentId);
    });
  }

  private async createTournamentFinalSnapshotAsync(tournamentId: string): Promise<void> {
    const tournament = await this.getTournamentByIdAsync(tournamentId);
    this.validateTournamentHasEnded(tournament);
    if (!tournament.finalizedAt) {
      const finalizationClaimed = await this.claimTournamentFinalizationAsync(tournament.id);
      if (finalizationClaimed) {
        await this.persistFinalPlacementsAsync(tournament.id);
      }
    }
  }

  private async getTournamentByIdAsync(tournamentId: string): Promise<TournamentEntity> {
    const filters: FindTournamentsEntity = { id: tournamentId };
    const tournaments = await this.tournamentsRepository.findAsync(filters);
    const tournament = tournaments[0];
    if (!tournament) {
      throw new Error(`Tournament ${tournamentId} was not found`);
    }
    const result = tournament;
    return result;
  }

  private validateTournamentHasEnded(tournament: TournamentEntity): void {
    const tournamentHasEnded = tournament.endsAt.getTime() <= Date.now();
    if (!tournamentHasEnded) {
      throw new Error(`Tournament ${tournament.id} cannot be finalized before ${tournament.endsAt.toISOString()}`);
    }
  }

  private async claimTournamentFinalizationAsync(tournamentId: string): Promise<boolean> {
    const entity: FinalizeTournamentEntity = { tournamentId, finalizedAt: new Date() };
    const claimedTournament = await this.tournamentsRepository.updateFinalizedAtAsync(entity);
    const result = claimedTournament !== null;
    return result;
  }

  private async persistFinalPlacementsAsync(tournamentId: string): Promise<void> {
    const filters: FindTournamentPlayerScoresEntity = { tournamentId };
    const playerScores = await this.tournamentsRepository.findPlayerScoresAsync(filters);
    const sortedPlayerScores = this.sortPlayerScores(playerScores);
    const placements = this.createTournamentPlacements(sortedPlayerScores);
    if (placements.length > 0) {
      await this.tournamentsRepository.createPlacementsAsync(placements);
    }
  }

  private sortPlayerScores(playerScores: TournamentPlayerScoreEntity[]): TournamentPlayerScoreEntity[] {
    const result = [...playerScores].sort((firstPlayer, secondPlayer): number => {
      const result = this.comparePlayerScoresForRanking(firstPlayer, secondPlayer);
      return result;
    });
    return result;
  }

  private comparePlayerScoresForRanking(firstPlayer: TournamentPlayerScoreEntity, secondPlayer: TournamentPlayerScoreEntity): number {
    const scoresAreEqual = firstPlayer.score === secondPlayer.score;
    let result = 0;
    if (scoresAreEqual) {
      if (firstPlayer.playerId < secondPlayer.playerId) {
        result = -1;
      } else if (firstPlayer.playerId > secondPlayer.playerId) {
        result = 1;
      }
    } else {
      result = firstPlayer.score > secondPlayer.score ? -1 : 1;
    }
    return result;
  }

  private createTournamentPlacements(playerScores: TournamentPlayerScoreEntity[]): TournamentPlacementEntity[] {
    const result = playerScores.map((playerScore, index): TournamentPlacementEntity => {
      const rank = index + 1;
      const result = this.mapper.map(playerScore, TournamentPlayerScoreEntity, TournamentPlacementEntity, { extraArgs: (): { rank: number } => ({ rank }) });
      return result;
    });
    return result;
  }
}
