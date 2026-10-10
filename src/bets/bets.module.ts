import { Module } from '@nestjs/common';
import { CommonModule } from '../common/common.module';
import { TournamentsModule } from '../tournaments/tournaments.module';
import { BetsController } from './controllers/bets.controller';
import { BetMapper } from './mappers/bet.mapper';
import { IBetTransactionsService, BetTransactionsService } from './services/bet-transactions.service';
import { IBetsService, BetsService } from './services/bet.service';

@Module({
  imports: [CommonModule, TournamentsModule],
  controllers: [BetsController],
  providers: [{ provide: IBetsService, useClass: BetsService }, { provide: IBetTransactionsService, useClass: BetTransactionsService }, BetMapper],
})
export class BetsModule {}
