import type { CompetitiveMatchLifecycleState } from "./competitive-cycle-lifecycle";

export type CompetitiveCycleWatchdogInput = {
  state: CompetitiveMatchLifecycleState;
  stateChangedAt: string;
  maxStateDurationMs: number;
};

export function isCompetitiveCycleStale(
  input: CompetitiveCycleWatchdogInput,
  now = new Date(),
) {
  if (["completed", "failed"].includes(input.state)) return false;

  const changedAt = new Date(input.stateChangedAt).getTime();
  return now.getTime() - changedAt > input.maxStateDurationMs;
}

export function competitiveCycleWatchdogAction(
  input: CompetitiveCycleWatchdogInput,
  now = new Date(),
) {
  return isCompetitiveCycleStale(input, now) ? "recover" : "none";
}
