export type MatchmakingCandidate = {
  id: string;
  rating: number;
  queuedAt: string;
};

export type MatchmakingPolicy = {
  minimumPlayers: number;
  initialRatingRange: number;
  maximumRatingRange: number;
  rangeExpansionPerMinute: number;
};

export const DEFAULT_MATCHMAKING_POLICY: MatchmakingPolicy = {
  minimumPlayers: 10,
  initialRatingRange: 100,
  maximumRatingRange: 500,
  rangeExpansionPerMinute: 25,
};

export function allowedRatingRange(
  queuedAt: string,
  now: Date,
  policy: MatchmakingPolicy = DEFAULT_MATCHMAKING_POLICY,
) {
  const waitedMinutes = Math.max(0, (now.getTime() - new Date(queuedAt).getTime()) / 60_000);
  return Math.min(
    policy.maximumRatingRange,
    policy.initialRatingRange + Math.floor(waitedMinutes) * policy.rangeExpansionPerMinute,
  );
}

export function isCandidateCompatible(
  anchor: MatchmakingCandidate,
  candidate: MatchmakingCandidate,
  now = new Date(),
  policy: MatchmakingPolicy = DEFAULT_MATCHMAKING_POLICY,
) {
  const range = Math.min(
    allowedRatingRange(anchor.queuedAt, now, policy),
    allowedRatingRange(candidate.queuedAt, now, policy),
  );
  return Math.abs(anchor.rating - candidate.rating) <= range;
}
