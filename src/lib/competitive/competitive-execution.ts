import { executeMatchmakingRun, type MatchmakingQueueSource } from "./matchmaking-runner";
import { commitFormedMatch, type MatchFormationStore } from "./match-formation-commit";
import type { MatchmakingPolicy } from "./matchmaking-policy";

export async function executeCompetitiveCycle(
  queue: MatchmakingQueueSource,
  matches: MatchFormationStore,
  policy?: MatchmakingPolicy,
) {
  const result = await executeMatchmakingRun(queue, new Date(), policy);
  const match = await commitFormedMatch(matches, result);

  return {
    result,
    match,
  };
}
