import { formBalancedMatch, type QueueCandidate } from "./match-formation";
import type { MatchmakingPolicy } from "./matchmaking-policy";

export type MatchmakingCycleResult =
  | { formed: false; reason: "insufficient_compatible_players" }
  | { formed: true; teamAIds: string[]; teamBIds: string[] };

export function runMatchmakingCycle(
  candidates: QueueCandidate[],
  now = new Date(),
  policy?: MatchmakingPolicy,
): MatchmakingCycleResult {
  const match = formBalancedMatch(candidates, now, policy);

  if (!match) {
    return { formed: false, reason: "insufficient_compatible_players" };
  }

  return {
    formed: true,
    teamAIds: match.teamA.map((player) => player.id),
    teamBIds: match.teamB.map((player) => player.id),
  };
}
