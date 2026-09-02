import { executeMatchmakingRun, type MatchmakingQueueSource } from "./matchmaking-runner";
import { dispatchCompetitiveMatch } from "./competitive-match-dispatch";
import { toCompetitiveCycleFailure } from "./competitive-cycle-failure";
import type { CompetitiveCycleResult } from "./competitive-cycle-result";
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
): Promise<CompetitiveCycleResult<Awaited<ReturnType<typeof executeMatchmakingRun>>, Awaited<ReturnType<typeof dispatchCompetitiveMatch>>>> {
  let matchmaking;

  try {
    matchmaking = await executeMatchmakingRun(queue, new Date(), policy);
  } catch (error) {
    return {
      ok: false,
      stage: "failed",
      matchmaking: null,
      dispatch: null,
      failure: toCompetitiveCycleFailure("matchmaking", error),
    };
  }

  if (!matchmaking.formed) {
    return { ok: true, stage: "queue", matchmaking, dispatch: null };
  }

  try {
    const dispatch = await dispatchCompetitiveMatch(
      matches,
      servers,
      provisioner,
      { teamAIds: matchmaking.teamAIds, teamBIds: matchmaking.teamBIds },
      region,
    );

    return { ok: true, stage: "server_ready", matchmaking, dispatch };
  } catch (error) {
    return {
      ok: false,
      stage: "failed",
      matchmaking,
      dispatch: null,
      failure: toCompetitiveCycleFailure("server_provisioning", error),
    };
  }
}
