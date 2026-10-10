import { createMap, forMember, mapFrom, type Mapper, type MappingProfile } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { CreateBetEntity } from '../../common/models/create-bet.entity';
import { CreateBetRequestDto } from '../models/dto/create-bet.dto';

@Injectable()
export class BetMapper extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile(): MappingProfile {
    const result: MappingProfile = (mapper: Mapper): void => {
      createMap(
        mapper,
        CreateBetRequestDto,
        CreateBetEntity,
        forMember(
          (destination): string => destination.externalBetId,
          mapFrom((source): string => source.externalBetId),
        ),
        forMember(
          (destination): string => destination.playerId,
          mapFrom((source): string => source.playerId),
        ),
        forMember(
          (destination): bigint => destination.amount,
          mapFrom((source): bigint => BigInt(source.amount)),
        ),
        forMember(
          (destination): string => destination.currency,
          mapFrom((source): string => source.currency),
        ),
        forMember(
          (destination): Date => destination.createdAt,
          mapFrom((source): Date => new Date(source.createdAt)),
        ),
      );
    };
    return result;
  }
}
