export type MatchState = "pending" | "ready" | "live" | "completed" | "cancelled";

export const MATCH_STATE_TRANSITIONS: Record<MatchState, MatchState[]> = {
  pending: ["ready", "cancelled"],
  ready: ["live", "cancelled"],
  live: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
};

export function canTransitionMatchState(from: MatchState, to: MatchState) {
  return MATCH_STATE_TRANSITIONS[from].includes(to);
}
