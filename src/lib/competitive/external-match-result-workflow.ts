export type ExternalMatchResult = {
  matchId: string;
  winnerTeamId: string;
  loserTeamId: string;
  winnerScore: number;
  loserScore: number;
};

export type ExternalMatchVerification =
  | { method: "demo"; verified: true }
  | { method: "captain_confirmation"; verified: boolean; confirmations: number };

export function canProcessExternalMatchResult(
  result: ExternalMatchResult,
  verification: ExternalMatchVerification,
) {
  return Boolean(
    result.matchId &&
      result.winnerTeamId &&
      result.loserTeamId &&
      result.winnerTeamId !== result.loserTeamId &&
      result.winnerScore >= 0 &&
      result.loserScore >= 0 &&
      verification.verified,
  );
}

export function assertExternalMatchResultProcessable(
  result: ExternalMatchResult,
  verification: ExternalMatchVerification,
) {
  if (!canProcessExternalMatchResult(result, verification)) {
    throw new Error("External match result has not been sufficiently verified");
  }
}
