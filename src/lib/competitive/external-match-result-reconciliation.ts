import type { ExternalMatchResultConsensus } from "./external-match-result-consensus";

export type ExternalMatchResultReconciliation =
  | { action: "wait_for_confirmation" }
  | { action: "apply_result"; matchId: string }
  | { action: "flag_for_review"; matchId: string };

export function reconcileExternalMatchResult(
  matchId: string,
  consensus: ExternalMatchResultConsensus,
): ExternalMatchResultReconciliation {
  if (consensus.status === "pending") return { action: "wait_for_confirmation" };
  if (consensus.status === "conflict") return { action: "flag_for_review", matchId };
  return { action: "apply_result", matchId };
}
