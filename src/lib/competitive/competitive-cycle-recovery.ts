import type { CompetitiveMatchLifecycleState } from "./competitive-cycle-lifecycle";

export type RecoverableCompetitiveCycle = {
  matchId: string;
  state: CompetitiveMatchLifecycleState;
  stateChangedAt: string;
};

export type CompetitiveCycleRecoveryPlan =
  | { action: "resume_server_provisioning" }
  | { action: "resume_result_processing" }
  | { action: "none" };

export function planCompetitiveCycleRecovery(
  cycle: RecoverableCompetitiveCycle,
): CompetitiveCycleRecoveryPlan {
  if (cycle.state === "server_provisioning") {
    return { action: "resume_server_provisioning" };
  }

  if (cycle.state === "processing_result") {
    return { action: "resume_result_processing" };
  }

  return { action: "none" };
}
