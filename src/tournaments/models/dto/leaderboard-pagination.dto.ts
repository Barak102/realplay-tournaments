import { Transform } from 'class-transformer';
import { IsInt, Max, Min } from 'class-validator';
import { LeaderboardPagination } from '../../constants/leaderboard-pagination';
import { toNumber } from '../../transforms/to-number.transform';

export abstract class LeaderboardPaginationRequestDto {
  @Transform(toNumber)
  @IsInt()
  @Min(1)
  @Max(LeaderboardPagination.MaximumPageSize)
  limit: number;

  @Transform(toNumber)
  @IsInt()
  @Min(0)
  offset: number;
}
