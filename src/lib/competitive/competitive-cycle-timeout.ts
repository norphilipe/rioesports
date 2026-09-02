export type CompetitiveCycleTimeout = {
  stage: string;
  startedAt: string;
  timeoutMs: number;
};

export function hasCompetitiveCycleTimedOut(
  timeout: CompetitiveCycleTimeout,
  now = new Date(),
) {
  const startedAt = new Date(timeout.startedAt).getTime();
  return now.getTime() - startedAt >= timeout.timeoutMs;
}

export function assertCompetitiveCycleNotTimedOut(
  timeout: CompetitiveCycleTimeout,
  now = new Date(),
) {
  if (hasCompetitiveCycleTimedOut(timeout, now)) {
    throw new Error(`Competitive cycle timed out during ${timeout.stage}`);
  }
}
