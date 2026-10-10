import { IsISO8601, IsString, Matches, MinLength, NotContains } from 'class-validator';
import { Regex } from '../../../common/constants/regex';
import { IsAfter } from '../../../common/validators/is-after.validator';

export class CreateTournamentRequestDto {
  @IsString()
  @MinLength(2)
  @Matches(Regex.TournamentName)
  @NotContains('\n')
  @NotContains('\r')
  name: string;

  @IsISO8601({ strict: true })
  startsAt: string;

  @IsISO8601({ strict: true })
  @IsAfter('startsAt')
  endsAt: string;
}

export class CreateTournamentResponseDto {
  id: string;
  name: string;
  startsAt: string;
  endsAt: string;
}
