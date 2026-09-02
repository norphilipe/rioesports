import type { ServerProvisioner } from "./server-provisioning";

export type MatchServerDispatchStore = {
  attachServer(input: { matchId: string; endpoint: string }): Promise<void>;
};

export async function dispatchMatchServer(
  provisioner: ServerProvisioner,
  store: MatchServerDispatchStore,
  matchId: string,
  region: string,
) {
  const assignment = await provisioner.provision({ matchId, region });
  validateAssignment(assignment);

  await store.attachServer({ matchId, endpoint: assignment.endpoint! });
  return assignment;
}

function validateAssignment(assignment: { status: string; endpoint?: string | null }) {
  if (assignment.status !== "ready" || !assignment.endpoint) {
    throw new Error("Dedicated server provisioning did not produce a ready endpoint");
  }
}
