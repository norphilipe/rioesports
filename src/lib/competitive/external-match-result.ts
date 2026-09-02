export type ExternalMatchResult = {
  matchId: string;
  teamAWins: number;
  teamBWins: number;
  winner: "A" | "B" | null;
  verified: boolean;
  source: "demo" | "manual";
};

export function determineExternalMatchWinner(teamAWins: number, teamBWins: number) {
  if (teamAWins === teamBWins) return null;
  return teamAWins > teamBWins ? "A" : "B";
}

export function createExternalMatchResult(input: {
  matchId: string;
  teamAWins: number;
  teamBWins: number;
  verified: boolean;
  source: "demo" | "manual";
}): ExternalMatchResult {
  return {
    ...input,
    winner: determineExternalMatchWinner(input.teamAWins, input.teamBWins),
  };
}
