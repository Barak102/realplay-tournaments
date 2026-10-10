import { Module } from '@nestjs/common';
import { IPrismaService, PrismaService } from './prisma.service';
import { IBetRepository, BetRepository } from './repositories/bet.repository';
import { ITournamentRepository, TournamentRepository } from './repositories/tournament.repository';

@Module({
  providers: [
    { provide: IPrismaService, useClass: PrismaService },
    { provide: IBetRepository, useClass: BetRepository },
    { provide: ITournamentRepository, useClass: TournamentRepository },
  ],
  exports: [IPrismaService, IBetRepository, ITournamentRepository],
})
export class DatabaseModule {}
