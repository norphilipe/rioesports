import { dispatchMatchServer, type MatchServerDispatchStore } from "./match-server-dispatch";
import type { MatchFormationStore } from "./match-formation-commit";
import type { ServerAssignment } from "./server-assignment";
import type { ServerProvisioner } from "./server-provisioning";

export type MatchDispatchResult = {
  matchId: string;
  assignment: ServerAssignment;
};

export async function dispatchCompetitiveMatch(
  matches: MatchFormationStore,
  servers: MatchServerDispatchStore,
  provisioner: ServerProvisioner,
  teams: { teamAIds: string[]; teamBIds: string[] },
  region: string,
): Promise<MatchDispatchResult> {
  const match = await matches.createMatch(teams);
  const assignment = await dispatchMatchServer(provisioner, servers, match.matchId, region);

  return { matchId: match.matchId, assignment };
}
