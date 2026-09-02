export type ProcessingSnapshot = {
  matchId: string;
  processingState: "pending" | "processing" | "completed" | "failed";
  resultRecorded: boolean;
  ratingApplied: boolean;
};

export type ReconciliationResult =
  | { consistent: true }
  | { consistent: false; reason: string };

export function reconcileMatchProcessing(snapshot: ProcessingSnapshot): ReconciliationResult {
  if (snapshot.processingState === "completed" && !snapshot.resultRecorded) {
    return { consistent: false, reason: "completed_without_result" };
  }

  if (snapshot.ratingApplied && !snapshot.resultRecorded) {
    return { consistent: false, reason: "rating_without_result" };
  }

  if (snapshot.processingState === "completed" && !snapshot.ratingApplied) {
    return { consistent: false, reason: "completed_without_rating" };
  }

  return { consistent: true };
}
