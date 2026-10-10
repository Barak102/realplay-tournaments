import { createMap, forMember, mapFrom, mapWithArguments, type Mapper, type MappingProfile } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { BetEntity } from '../../bets/models/bet.entity';
import { TournamentPlayerScoreAggregateModel } from '../../common/database/models/tournament-player-score-aggregate.model';
import { TournamentRecordModel } from '../../common/database/models/tournament-record.model';
import { CreateTournamentEntity } from '../../common/models/create-tournament.entity';
import { FindTournamentsEntity } from '../../common/models/find-tournaments.entity';
import { SortedSetEntryModel } from '../../common/redis/models/sorted-set-entry.model';
import { CreateTournamentRequestDto, CreateTournamentResponseDto } from '../models/dto/create-tournament.dto';
import { LeaderboardPlayerDto } from '../models/leaderboard-player.model';
import { TournamentBetEntity } from '../models/tournament-bet.entity';
import { TournamentEntity } from '../models/tournament.entity';
import { TournamentPlacementEntity } from '../models/tournament-placement.entity';
import { TournamentPlayerScoreEntity } from '../models/tournament-player-score.entity';

@Injectable()
export class TournamentMapper extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile(): MappingProfile {
    const result: MappingProfile = (mapper: Mapper): void => {
      createMap(
        mapper,
        CreateTournamentRequestDto,
        CreateTournamentEntity,
        forMember(
          (destination): string => destination.name,
          mapFrom((source): string => source.name),
        ),
        forMember(
          (destination): Date => destination.startsAt,
          mapFrom((source): Date => new Date(source.startsAt)),
        ),
        forMember(
          (destination): Date => destination.endsAt,
          mapFrom((source): Date => new Date(source.endsAt)),
        ),
      );
      createMap(
        mapper,
        TournamentRecordModel,
        TournamentEntity,
        forMember(
          (destination): string => destination.id,
          mapFrom((source): string => source.id),
        ),
        forMember(
          (destination): string => destination.name,
          mapFrom((source): string => source.name),
        ),
        forMember(
          (destination): Date => destination.startsAt,
          mapFrom((source): Date => source.startsAt),
        ),
        forMember(
          (destination): Date => destination.endsAt,
          mapFrom((source): Date => source.endsAt),
        ),
        forMember(
          (destination): Date | null => destination.finalizedAt,
          mapFrom((source): Date | null => source.finalizedAt),
        ),
      );
      createMap(
        mapper,
        TournamentPlayerScoreAggregateModel,
        TournamentPlayerScoreEntity,
        forMember(
          (destination): string => destination.tournamentId,
          mapWithArguments((source, extraArguments): string => String(extraArguments.tournamentId)),
        ),
        forMember(
          (destination): string => destination.playerId,
          mapFrom((source): string => source.playerId),
        ),
        forMember(
          (destination): bigint => destination.score,
          mapFrom((source): bigint => source._sum.amount ?? 0n),
        ),
      );
      createMap(
        mapper,
        BetEntity,
        FindTournamentsEntity,
        forMember(
          (destination): Date | undefined => destination.createdAt,
          mapFrom((source): Date => source.createdAt),
        ),
      );
      createMap(
        mapper,
        TournamentEntity,
        CreateTournamentResponseDto,
        forMember(
          (destination): string => destination.id,
          mapFrom((source): string => source.id),
        ),
        forMember(
          (destination): string => destination.name,
          mapFrom((source): string => source.name),
        ),
        forMember(
          (destination): string => destination.startsAt,
          mapFrom((source): string => source.startsAt.toISOString()),
        ),
        forMember(
          (destination): string => destination.endsAt,
          mapFrom((source): string => source.endsAt.toISOString()),
        ),
      );
      createMap(
        mapper,
        TournamentEntity,
        TournamentBetEntity,
        forMember(
          (destination): string => destination.tournamentId,
          mapFrom((source): string => source.id),
        ),
        forMember(
          (destination): string => destination.betId,
          mapWithArguments((source, extraArguments): string => String(extraArguments.betId)),
        ),
      );
      createMap(
        mapper,
        TournamentPlayerScoreEntity,
        SortedSetEntryModel,
        forMember(
          (destination): string => destination.member,
          mapFrom((source): string => source.playerId),
        ),
        forMember(
          (destination): number => destination.score,
          mapFrom((source): number => Number(source.score)),
        ),
      );
      createMap(
        mapper,
        TournamentPlayerScoreEntity,
        TournamentPlacementEntity,
        forMember(
          (destination): string => destination.tournamentId,
          mapFrom((source): string => source.tournamentId),
        ),
        forMember(
          (destination): string => destination.playerId,
          mapFrom((source): string => source.playerId),
        ),
        forMember(
          (destination): bigint => destination.score,
          mapFrom((source): bigint => source.score),
        ),
        forMember(
          (destination): number => destination.rank,
          mapWithArguments((source, extraArguments): number => Number(extraArguments.rank)),
        ),
      );
      createMap(
        mapper,
        SortedSetEntryModel,
        LeaderboardPlayerDto,
        forMember(
          (destination): string => destination.playerId,
          mapFrom((source): string => source.member),
        ),
        forMember(
          (destination): number => destination.score,
          mapFrom((source): number => source.score),
        ),
        forMember(
          (destination): number => destination.rank,
          mapWithArguments((source, extraArguments): number => Number(extraArguments.rank)),
        ),
      );
    };
    return result;
  }
}
