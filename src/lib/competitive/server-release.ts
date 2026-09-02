import type { ServerProvisioner } from "./server-provisioning";

export async function releaseCompetitiveMatchServer(
  provisioner: ServerProvisioner,
  matchId: string,
) {
  if (!matchId) throw new Error("A match id is required to release a server");
  await provisioner.release(matchId);
}
