import { executeMatchmakingRun, type MatchmakingQueueSource } from "./matchmaking-runner";
import { dispatchCompetitiveMatch } from "./competitive-match-dispatch";
import type { MatchFormationStore } from "./match-formation-commit";
import type { MatchServerDispatchStore } from "./match-server-dispatch";
import type { MatchmakingPolicy } from "./matchmaking-policy";
import type { ServerProvisioner } from "./server-provisioning";

export async function runCompetitiveCycle(
  queue: MatchmakingQueueSource,
  matches: MatchFormationStore,
  servers: MatchServerDispatchStore,
  provisioner: ServerProvisioner,
  region: string,
  policy?: MatchmakingPolicy,
) {
  const matchmaking = await executeMatchmakingRun(queue, new Date(), policy);

  if (!matchmaking.formed) {
    return { stage: "queue" as const, matchmaking, dispatch: null };
  }

  const dispatch = await dispatchCompetitiveMatch(
    matches,
    servers,
    provisioner,
    { teamAIds: matchmaking.teamAIds, teamBIds: matchmaking.teamBIds },
    region,
  );

  return { stage: "server_ready" as const, matchmaking, dispatch };
}
