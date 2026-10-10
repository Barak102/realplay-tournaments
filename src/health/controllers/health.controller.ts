import { Controller, Get, Inject } from '@nestjs/common';
import { ActionsName } from '../enums/actions-name.enum';
import { ControllerNames } from '../enums/controller-names.enum';
import { GetHealthResponseDto } from '../models/dto/get-health.dto';
import { IHealthService } from '../services/health.service';

@Controller(ControllerNames.Health)
export class HealthController {
  constructor(@Inject(IHealthService) private readonly healthService: IHealthService) {}

  @Get(ActionsName.GetHealth)
  async getHealthAsync(): Promise<GetHealthResponseDto> {
    const response = await this.healthService.getHealthAsync();
    return response;
  }
}
