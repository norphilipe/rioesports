export type MatchmakingRunHealth = {
  lastRunAt: string | null;
  lastRunSucceeded: boolean;
  consecutiveFailures: number;
};

export function isMatchmakingRunnerHealthy(
  health: MatchmakingRunHealth,
  maxConsecutiveFailures = 3,
) {
  return health.lastRunSucceeded && health.consecutiveFailures < maxConsecutiveFailures;
}
