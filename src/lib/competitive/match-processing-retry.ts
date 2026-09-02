import type { MatchProcessingState } from "./match-processing";

export type MatchProcessingRetry = {
  attempt: number;
  maxAttempts: number;
  nextAttemptAt: Date | null;
};

export function canRetryMatchProcessing(
  state: MatchProcessingState,
  retry: MatchProcessingRetry,
  now = new Date(),
) {
  return (
    state === "failed" &&
    retry.attempt < retry.maxAttempts &&
    (!retry.nextAttemptAt || retry.nextAttemptAt <= now)
  );
}

export function calculateRetryDelayMs(attempt: number) {
  const normalizedAttempt = Math.max(1, attempt);
  return Math.min(300_000, 5_000 * 2 ** (normalizedAttempt - 1));
}
