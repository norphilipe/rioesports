export type MatchProcessingState = "pending" | "processing" | "completed" | "failed";

export type MatchProcessingClaim = {
  matchId: string;
  state: MatchProcessingState;
  claimedAt: string | null;
};

export function canBeginMatchProcessing(claim: MatchProcessingClaim) {
  return claim.state === "pending" || claim.state === "failed";
}

export function isMatchProcessingFinal(state: MatchProcessingState) {
  return state === "completed";
}
