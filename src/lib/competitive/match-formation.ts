import { balanceTeams, type BalancedTeams, type RatedPlayer } from "./team-balance";
import {
  DEFAULT_MATCHMAKING_POLICY,
  isCandidateCompatible,
  type MatchmakingCandidate,
  type MatchmakingPolicy,
} from "./matchmaking-policy";

export type QueueCandidate = MatchmakingCandidate & RatedPlayer;

export function selectMatchCandidates(
  candidates: QueueCandidate[],
  now = new Date(),
  policy: MatchmakingPolicy = DEFAULT_MATCHMAKING_POLICY,
) {
  if (candidates.length < policy.minimumPlayers) return [];

  const anchor = candidates[0];
  const compatible = candidates.filter((candidate) =>
    isCandidateCompatible(anchor, candidate, now, policy),
  );

  return compatible.slice(0, policy.minimumPlayers);
}

export function formBalancedMatch(
  candidates: QueueCandidate[],
  now = new Date(),
  policy: MatchmakingPolicy = DEFAULT_MATCHMAKING_POLICY,
): BalancedTeams | null {
  const selected = selectMatchCandidates(candidates, now, policy);
  if (selected.length !== policy.minimumPlayers) return null;
  return balanceTeams(selected);
}
