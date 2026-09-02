export type MatchProcessingRecovery = {
  state: "failed" | "processing";
  attemptCount: number;
  lastAttemptAt: string | null;
};

export function canRetryMatchProcessing(
  recovery: MatchProcessingRecovery,
  now = new Date(),
  maxAttempts = 5,
  baseDelayMs = 5_000,
) {
  if (recovery.state !== "failed" || recovery.attemptCount >= maxAttempts) {
    return false;
  }

  if (!recovery.lastAttemptAt) return true;

  const delay = baseDelayMs * 2 ** Math.max(0, recovery.attemptCount - 1);
  const elapsed = now.getTime() - new Date(recovery.lastAttemptAt).getTime();
  return elapsed >= delay;
}

export function nextMatchProcessingDelay(
  attemptCount: number,
  baseDelayMs = 5_000,
) {
  return baseDelayMs * 2 ** Math.max(0, attemptCount - 1);
}
