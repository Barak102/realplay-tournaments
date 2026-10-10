import { Body, Controller, Inject, Post } from '@nestjs/common';
import { ActionsName } from '../enums/actions-name.enum';
import { ControllerNames } from '../enums/controller-names.enum';
import { CreateBetRequestDto, CreateBetResponseDto } from '../models/dto/create-bet.dto';
import { IBetsService } from '../services/bet.service';

@Controller(ControllerNames.Bets)
export class BetsController {
  constructor(
    @Inject(IBetsService)
    private readonly betsService: IBetsService,
  ) {}

  @Post(ActionsName.CreateBet)
  async createBetAsync(@Body() request: CreateBetRequestDto): Promise<CreateBetResponseDto> {
    const response = await this.betsService.createBetAsync(request);
    return response;
  }
}
