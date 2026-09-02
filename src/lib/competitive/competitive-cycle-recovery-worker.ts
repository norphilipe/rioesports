import type { RecoverableCompetitiveCycle } from "./competitive-cycle-recovery";
import { executeCompetitiveCycleRecovery, type CompetitiveCycleRecoveryHandlers } from "./competitive-cycle-recovery-executor";

export type CompetitiveCycleRecoverySource = {
  listRecoverableCycles(): Promise<RecoverableCompetitiveCycle[]>;
};

export async function runCompetitiveCycleRecoveryWorker(
  source: CompetitiveCycleRecoverySource,
  handlers: CompetitiveCycleRecoveryHandlers,
) {
  const cycles = await source.listRecoverableCycles();
  const recovered = [] as Array<{ matchId: string; action: string }>;

  for (const cycle of cycles) {
    const result = await executeCompetitiveCycleRecovery(cycle, handlers);
    recovered.push({ matchId: cycle.matchId, action: result.action });
  }

  return recovered;
}
