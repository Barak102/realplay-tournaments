import { IsInt, IsISO8601, IsNotEmpty, IsString, Length, Matches, Max, Min } from 'class-validator';
import { BetLimits } from '../../../common/constants/bet-limits';
import { Regex } from '../../../common/constants/regex';

export class CreateBetRequestDto {
  @IsString()
  @IsNotEmpty()
  @Matches(Regex.ContainsNonWhitespace)
  externalBetId: string;

  @IsString()
  @IsNotEmpty()
  @Matches(Regex.ContainsNonWhitespace)
  playerId: string;

  @IsInt()
  @Min(1)
  @Max(BetLimits.MaximumAmount)
  amount: number;

  @IsString()
  @Length(3, 3)
  @Matches(Regex.Currency)
  currency: string;

  @IsISO8601({ strict: true })
  createdAt: string;
}

export class CreateBetResponseDto {
  success: boolean;
}
