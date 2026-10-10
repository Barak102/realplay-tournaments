import { SortDirection } from '../enums/sort-direction.enum';

export class FindTournamentsEntity {
  id?: string;
  name?: string;
  createdAt?: Date;
  betId?: string;
  order?: SortDirection;
}
