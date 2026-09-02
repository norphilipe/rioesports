import { planCompetitiveCycleRecovery, type RecoverableCompetitiveCycle } from "./competitive-cycle-recovery";

export type CompetitiveCycleRecoveryHandlers = {
  resumeServerProvisioning(matchId: string): Promise<void>;
  resumeResultProcessing(matchId: string): Promise<void>;
};

export async function executeCompetitiveCycleRecovery(
  cycle: RecoverableCompetitiveCycle,
  handlers: CompetitiveCycleRecoveryHandlers,
) {
  const plan = planCompetitiveCycleRecovery(cycle);

  if (plan.action === "resume_server_provisioning") {
    await handlers.resumeServerProvisioning(cycle.matchId);
  }

  if (plan.action === "resume_result_processing") {
    await handlers.resumeResultProcessing(cycle.matchId);
  }

  return plan;
}
