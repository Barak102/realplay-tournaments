import { Inject, Injectable } from '@nestjs/common';
import { ITournamentLeaderboardsService } from '../../tournaments/services/tournament-leaderboards.service';
import { CreateBetRequestDto, CreateBetResponseDto } from '../models/dto/create-bet.dto';
import { IBetTransactionsService } from './bet-transactions.service';

export interface IBetsService {
  createBetAsync(request: CreateBetRequestDto): Promise<CreateBetResponseDto>;
}

export const IBetsService = Symbol('IBetsService');

@Injectable()
export class BetsService implements IBetsService {
  constructor(
    @Inject(IBetTransactionsService) private readonly betTransactions: IBetTransactionsService,
    @Inject(ITournamentLeaderboardsService) private readonly tournamentLeaderboardsService: ITournamentLeaderboardsService,
  ) {}

  async createBetAsync(request: CreateBetRequestDto): Promise<CreateBetResponseDto> {
    const bet = await this.betTransactions.createBetAsync(request);
    await this.tournamentLeaderboardsService.updateLeaderboardsForAcceptedBetAsync(bet);
    const result: CreateBetResponseDto = { success: true };
    return result;
  }
}
