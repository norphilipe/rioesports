import { runMatchmakingCycle, type MatchmakingCycleResult } from "./matchmaking-cycle";
import type { QueueCandidate } from "./match-formation";
import type { MatchmakingPolicy } from "./matchmaking-policy";

export type MatchmakingQueueSource = {
  listCandidates(): Promise<QueueCandidate[]>;
};

export async function executeMatchmakingRun(
  source: MatchmakingQueueSource,
  now = new Date(),
  policy?: MatchmakingPolicy,
): Promise<MatchmakingCycleResult> {
  const candidates = await source.listCandidates();
  return runMatchmakingCycle(candidates, now, policy);
}
