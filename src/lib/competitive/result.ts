export type CompetitiveMatchResult = {
  matchId: string;
  winnerTeamSide: "team_a" | "team_b";
  source: string;
  recordedAt: string;
};

export function validateMatchResult(result: CompetitiveMatchResult) {
  return Boolean(result.matchId && result.source && result.recordedAt);
}
