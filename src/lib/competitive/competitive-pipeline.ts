import { runMatchmakingCycle } from "./matchmaking-cycle";
import type { QueueCandidate } from "./match-formation";
import type { MatchmakingPolicy } from "./matchmaking-policy";

export type CompetitivePipelineStage =
  | "queue"
  | "match_formed"
  | "server_pending"
  | "result_pending"
  | "rating_pending"
  | "completed";

export function determinePipelineStage(
  candidates: QueueCandidate[],
  now = new Date(),
  policy?: MatchmakingPolicy,
): CompetitivePipelineStage {
  const cycle = runMatchmakingCycle(candidates, now, policy);
  return cycle.formed ? "match_formed" : "queue";
}
