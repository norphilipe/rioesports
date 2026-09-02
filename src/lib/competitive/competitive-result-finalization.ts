export type CompetitiveResultFinalizationInput = {
  matchId: string;
  resultRecorded: boolean;
  ratingApplied: boolean;
};

export function canFinalizeCompetitiveResult(
  input: CompetitiveResultFinalizationInput,
) {
  return Boolean(
    input.matchId &&
    input.resultRecorded &&
    input.ratingApplied,
  );
}

export function assertCompetitiveResultFinalizable(
  input: CompetitiveResultFinalizationInput,
) {
  if (!canFinalizeCompetitiveResult(input)) {
    throw new Error("Competitive match cannot be finalized before result and rating are persisted");
  }
}
