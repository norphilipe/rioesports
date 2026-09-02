export type FinalizationRecord = {
  matchId: string;
  finalizedAt: string;
};

export function canFinalizeMatch(
  matchId: string,
  finalizedMatches: Iterable<FinalizationRecord>,
) {
  for (const record of finalizedMatches) {
    if (record.matchId === matchId) return false;
  }
  return true;
}
