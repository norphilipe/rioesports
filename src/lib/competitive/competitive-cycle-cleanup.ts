import type { ServerProvisioner } from "./server-provisioning";

export async function cleanupCompetitiveCycle(
  provisioner: ServerProvisioner,
  matchId: string | null | undefined,
) {
  if (!matchId) return { released: false as const, reason: "no_match" as const };

  await provisioner.release(matchId);
  return { released: true as const, reason: "released" as const };
}
