export type ExternalMatchResult = {
  matchId: string;
  winnerTeamId: string;
  scoreA: number;
  scoreB: number;
};

export type ExternalMatchResultSubmission = ExternalMatchResult & {
  submittedBy: string;
  submittedAt: string;
};

export function validateExternalMatchResult(result: ExternalMatchResult) {
  if (!result.matchId || !result.winnerTeamId) {
    throw new Error("Match and winner identifiers are required");
  }

  if (!Number.isInteger(result.scoreA) || !Number.isInteger(result.scoreB)) {
    throw new Error("Match scores must be integers");
  }

  if (result.scoreA < 0 || result.scoreB < 0 || result.scoreA === result.scoreB) {
    throw new Error("Match scores must be non-negative and cannot end in a draw");
  }
}

export function externalMatchResultsAgree(
  first: ExternalMatchResult,
  second: ExternalMatchResult,
) {
  return first.matchId === second.matchId &&
    first.winnerTeamId === second.winnerTeamId &&
    first.scoreA === second.scoreA &&
    first.scoreB === second.scoreB;
}
