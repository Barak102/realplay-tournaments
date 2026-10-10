import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { Module } from '@nestjs/common';
import { DatabaseModule } from './common/database/database.module';
import { QueuesModule } from './common/queues/queues.module';
import { TournamentMapper } from './tournaments/mappers/tournament.mapper';
import { TournamentFinalizationProcessor } from './tournaments/processors/tournament-finalization.processor';
import { ITournamentFinalizationService, TournamentFinalizationService } from './tournaments/services/tournament-finalization.service';

@Module({
  imports: [AutomapperModule.forRoot({ strategyInitializer: classes() }), DatabaseModule, QueuesModule],
  providers: [{ provide: ITournamentFinalizationService, useClass: TournamentFinalizationService }, TournamentFinalizationProcessor, TournamentMapper],
})
export class WorkerModule {}
