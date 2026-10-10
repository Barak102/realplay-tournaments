export const TournamentFinalizationJobOptions = {
  Attempts: 3,
  BackoffType: 'exponential',
  BackoffDelay: 1_000,
  JobIdPrefix: 'finalize-tournament',
} as const;
