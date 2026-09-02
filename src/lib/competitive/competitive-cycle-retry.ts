export type CompetitiveRetryPolicy = {
  maxAttempts: number;
  baseDelayMs: number;
  maxDelayMs: number;
};

export function competitiveRetryDelay(
  attempt: number,
  policy: CompetitiveRetryPolicy,
) {
  if (attempt < 1) throw new Error("Retry attempt must be greater than zero");
  if (policy.maxAttempts < 1) throw new Error("Retry policy requires at least one attempt");

  return Math.min(
    policy.baseDelayMs * 2 ** (attempt - 1),
    policy.maxDelayMs,
  );
}

export function canRetryCompetitiveOperation(
  attempt: number,
  policy: CompetitiveRetryPolicy,
) {
  return attempt < policy.maxAttempts;
}
