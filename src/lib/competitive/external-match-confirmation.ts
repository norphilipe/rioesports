import type { ExternalMatchResult } from "./external-match-result";

export type ExternalMatchConfirmation = {
  matchId: string;
  captainId: string;
  team: "A" | "B";
  teamAWins: number;
  teamBWins: number;
  confirmedAt: string;
};

export function doExternalMatchConfirmationsAgree(
  confirmations: ExternalMatchConfirmation[],
) {
  if (confirmations.length < 2) return false;

  const [first, second] = confirmations;

  return (
    first.matchId === second.matchId &&
    first.team !== second.team &&
    first.teamAWins === second.teamAWins &&
    first.teamBWins === second.teamBWins
  );
}

export function canVerifyManualExternalResult(
  result: ExternalMatchResult,
  confirmations: ExternalMatchConfirmation[],
) {
  return result.source === "manual" && doExternalMatchConfirmationsAgree(confirmations);
}
