import type { CompetitiveMatchResult } from "./result";

export function validateCompetitiveResultPayload(
  result: CompetitiveMatchResult,
  participantIds: string[],
) {
  if (!result.matchId || !result.source || !result.recordedAt) {
    throw new Error("Incomplete match result payload");
  }

  if (participantIds.length !== 10) {
    throw new Error("Competitive matches require exactly 10 participants");
  }

  if (new Set(participantIds).size !== participantIds.length) {
    throw new Error("Duplicate match participants are not allowed");
  }

  return true;
}
