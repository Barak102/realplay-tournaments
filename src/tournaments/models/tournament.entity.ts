export class TournamentEntity {
  id: string;
  name: string;
  startsAt: Date;
  endsAt: Date;
  finalizedAt: Date | null;
}
