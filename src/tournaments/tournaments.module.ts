import { Module } from '@nestjs/common';
import { CommonModule } from '../common/common.module';
import { QueuesModule } from '../common/queues/queues.module';
import { TournamentsController } from './controllers/tournaments.controller';
import { TournamentMapper } from './mappers/tournament.mapper';
import { ITournamentLeaderboardsService, TournamentLeaderboardsService } from './services/tournament-leaderboards.service';
import { ITournamentsService, TournamentsService } from './services/tournaments.service';

@Module({
  imports: [CommonModule, QueuesModule],
  controllers: [TournamentsController],
  providers: [{ provide: ITournamentsService, useClass: TournamentsService }, { provide: ITournamentLeaderboardsService, useClass: TournamentLeaderboardsService }, TournamentMapper],
  exports: [ITournamentLeaderboardsService],
})
export class TournamentsModule {}
