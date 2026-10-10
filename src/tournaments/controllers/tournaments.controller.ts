import { Body, Controller, Get, Inject, Param, Post, Query } from '@nestjs/common';
import { ActionsName } from '../enums/actions-name.enum';
import { ControllerNames } from '../enums/controller-names.enum';
import { CreateTournamentRequestDto, CreateTournamentResponseDto } from '../models/dto/create-tournament.dto';
import { GetLeaderboardParamsRequestDto, GetLeaderboardQueryRequestDto, GetLeaderboardRequestDto, GetLeaderboardResponseDto } from '../models/dto/get-leaderboard.dto';
import { ITournamentsService } from '../services/tournaments.service';

@Controller(ControllerNames.Tournaments)
export class TournamentsController {
  constructor(
    @Inject(ITournamentsService)
    private readonly tournamentsService: ITournamentsService,
  ) {}

  @Post(ActionsName.CreateTournament)
  async createTournamentAsync(@Body() request: CreateTournamentRequestDto): Promise<CreateTournamentResponseDto> {
    const response = await this.tournamentsService.createTournamentAsync(request);
    return response;
  }

  @Get(ActionsName.GetLeaderboard)
  async getLeaderboardAsync(@Param() params: GetLeaderboardParamsRequestDto, @Query() query: GetLeaderboardQueryRequestDto): Promise<GetLeaderboardResponseDto> {
    const request: GetLeaderboardRequestDto = { ...query, ...params };
    const response = await this.tournamentsService.getLeaderboardAsync(request);
    return response;
  }
}
