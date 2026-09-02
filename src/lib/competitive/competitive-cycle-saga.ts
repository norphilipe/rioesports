import { determineCompetitiveCompensation } from "./competitive-cycle-compensation";
import { cleanupCompetitiveCycle } from "./competitive-cycle-cleanup";
import type { ServerProvisioner } from "./server-provisioning";

export type CompetitiveCycleResources = {
  matchId?: string | null;
  serverAssigned?: boolean;
  processingStarted?: boolean;
};

export async function compensateCompetitiveCycleFailure(
  provisioner: ServerProvisioner,
  resources: CompetitiveCycleResources,
) {
  const compensation = determineCompetitiveCompensation(resources);

  if (compensation.action === "release_server" && resources.matchId) {
    await cleanupCompetitiveCycle(provisioner, resources.matchId);
  }

  return compensation;
}
