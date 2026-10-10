export const Regex = {
  TournamentName: /^(?=.*[a-zA-Z])[a-zA-Z ]+$/,
  Currency: /^[A-Z]{3}$/,
  ContainsNonWhitespace: /\S/,
} as const;
