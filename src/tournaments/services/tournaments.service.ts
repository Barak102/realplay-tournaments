import type { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { InjectQueue } from '@nestjs/bullmq';
import { Inject, Injectable, Logger } from '@nestjs/common';
import type { Queue } from 'bullmq';
import { ITournamentRepository } from '../../common/database/repositories/tournament.repository';
import { CreateTournamentEntity } from '../../common/models/create-tournament.entity';
import { JobNames } from '../../common/queues/enums/job-names.enum';
import { QueueNames } from '../../common/queues/enums/queue-names.enum';
import { TournamentFinalizationJobOptions } from '../constants/tournament-finalization-job-options';
import { TournamentEntity } from '../models/tournament.entity';
import { CreateTournamentRequestDto, CreateTournamentResponseDto } from '../models/dto/create-tournament.dto';
import { FinalizeTournamentJobModel } from '../models/finalize-tournament-job.model';
import { GetLeaderboardRequestDto, GetLeaderboardResponseDto } from '../models/dto/get-leaderboard.dto';
import { ITournamentLeaderboardsService } from './tournament-leaderboards.service';

export interface ITournamentsService {
  createTournamentAsync(request: CreateTournamentRequestDto): Promise<CreateTournamentResponseDto>;
  getLeaderboardAsync(request: GetLeaderboardRequestDto): Promise<GetLeaderboardResponseDto>;
}

export const ITournamentsService = Symbol('ITournamentsService');

@Injectable()
export class TournamentsService implements ITournamentsService {
  private readonly logger = new Logger(TournamentsService.name);

  constructor(
    @Inject(ITournamentRepository) private readonly tournamentsRepository: ITournamentRepository,
    @Inject(ITournamentLeaderboardsService) private readonly tournamentLeaderboardsService: ITournamentLeaderboardsService,
    @InjectQueue(QueueNames.TournamentFinalization) private readonly tournamentFinalizationQueue: Queue<FinalizeTournamentJobModel, void, JobNames>,
    @InjectMapper() private readonly mapper: Mapper,
  ) {}

  async createTournamentAsync(request: CreateTournamentRequestDto): Promise<CreateTournamentResponseDto> {
    const entity = this.mapper.map(request, CreateTournamentRequestDto, CreateTournamentEntity);
    const tournament = await this.tournamentsRepository.createTournamentAsync(entity);
    await this.scheduleTournamentFinalizationAsync(tournament);
    const result = this.mapper.map(tournament, TournamentEntity, CreateTournamentResponseDto);
    return result;
  }

  async getLeaderboardAsync(request: GetLeaderboardRequestDto): Promise<GetLeaderboardResponseDto> {
    const result = await this.tournamentLeaderboardsService.getLeaderboardAsync(request);
    return result;
  }

  private async scheduleTournamentFinalizationAsync(tournament: TournamentEntity): Promise<void> {
    const jobData: FinalizeTournamentJobModel = { tournamentId: tournament.id };
    const delay = this.getTournamentFinalizationDelay(tournament.endsAt);
    const jobId = this.getTournamentFinalizationJobId(tournament.id);
    try {
      await this.tournamentFinalizationQueue.add(JobNames.FinalizeTournament, jobData, {
        jobId,
        delay,
        attempts: TournamentFinalizationJobOptions.Attempts,
        backoff: { type: TournamentFinalizationJobOptions.BackoffType, delay: TournamentFinalizationJobOptions.BackoffDelay },
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to schedule finalization for tournament ${tournament.id}: ${message}`);
      throw error;
    }
  }

  private getTournamentFinalizationDelay(endsAt: Date): number {
    const result = Math.max(endsAt.getTime() - Date.now(), 0);
    return result;
  }

  private getTournamentFinalizationJobId(tournamentId: string): string {
    const result = `${TournamentFinalizationJobOptions.JobIdPrefix}-${tournamentId}`;
    return result;
  }
}
