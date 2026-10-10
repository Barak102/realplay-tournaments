import { Module } from '@nestjs/common';
import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { BetsModule } from './bets/bets.module';
import { HealthModule } from './health/health.module';
import { TournamentsModule } from './tournaments/tournaments.module';

@Module({
  imports: [AutomapperModule.forRoot({ strategyInitializer: classes() }), HealthModule, TournamentsModule, BetsModule],
})
export class AppModule {}
