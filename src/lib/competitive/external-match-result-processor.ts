import {
  assertExternalMatchResultProcessable,
  type ExternalMatchResult,
  type ExternalMatchVerification,
} from "./external-match-result-workflow";

export type ExternalMatchResultProcessor = {
  recordResult(result: ExternalMatchResult): Promise<void>;
  applyRatings(result: ExternalMatchResult): Promise<void>;
  finalizeMatch(matchId: string): Promise<void>;
};

export async function processVerifiedExternalMatchResult(
  processor: ExternalMatchResultProcessor,
  result: ExternalMatchResult,
  verification: ExternalMatchVerification,
) {
  assertExternalMatchResultProcessable(result, verification);

  await processor.recordResult(result);
  await processor.applyRatings(result);
  await processor.finalizeMatch(result.matchId);

  return { matchId: result.matchId, processed: true };
}
