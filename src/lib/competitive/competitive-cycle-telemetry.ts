import type { CompetitiveMatchLifecycleState } from "./competitive-cycle-lifecycle";

export type CompetitiveCycleTelemetry = {
  matchId: string;
  state: CompetitiveMatchLifecycleState;
  occurredAt: string;
  detail?: string;
};

export function createCompetitiveCycleTelemetry(
  matchId: string,
  state: CompetitiveMatchLifecycleState,
  detail?: string,
): CompetitiveCycleTelemetry {
  if (!matchId) throw new Error("Match id is required for competitive telemetry");

  return { matchId, state, occurredAt: new Date().toISOString(), detail };
}
