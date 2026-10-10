import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject, Logger } from '@nestjs/common';
import type { Job } from 'bullmq';
import { JobNames } from '../../common/queues/enums/job-names.enum';
import { QueueNames } from '../../common/queues/enums/queue-names.enum';
import { FinalizeTournamentJobModel } from '../models/finalize-tournament-job.model';
import { ITournamentFinalizationService } from '../services/tournament-finalization.service';

@Processor(QueueNames.TournamentFinalization)
export class TournamentFinalizationProcessor extends WorkerHost {
  private readonly logger = new Logger(TournamentFinalizationProcessor.name);

  constructor(@Inject(ITournamentFinalizationService) private readonly tournamentFinalizationService: ITournamentFinalizationService) {
    super();
  }

  async process(job: Job<FinalizeTournamentJobModel, void, JobNames>): Promise<void> {
    try {
      if (job.name === JobNames.FinalizeTournament) {
        await this.tournamentFinalizationService.finalizeTournamentAsync(job.data.tournamentId);
      } else {
        throw new Error(`Unsupported tournament finalization job: ${job.name}`);
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Tournament finalization job ${job.id ?? 'unknown'} failed: ${message}`);
      throw error;
    }
  }
}
