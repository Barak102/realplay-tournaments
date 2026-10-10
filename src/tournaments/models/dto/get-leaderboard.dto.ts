import { IsUUID } from 'class-validator';
import type { LeaderboardPlayerDto } from '../leaderboard-player.model';
import { LeaderboardPaginationRequestDto } from './leaderboard-pagination.dto';

export class GetLeaderboardParamsRequestDto {
  @IsUUID()
  id: string;
}

export class GetLeaderboardQueryRequestDto extends LeaderboardPaginationRequestDto {}

export class GetLeaderboardRequestDto extends LeaderboardPaginationRequestDto {
  @IsUUID()
  id: string;
}

export class GetLeaderboardResponseDto {
  players: LeaderboardPlayerDto[];
}
