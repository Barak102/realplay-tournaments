export class TournamentRecordModel {
  id: string;
  name: string;
  startsAt: Date;
  endsAt: Date;
  finalizedAt: Date | null;
}
