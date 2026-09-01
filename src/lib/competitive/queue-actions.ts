export const MATCHMAKING_RPC = {
  join: "join_matchmaking_queue",
  leave: "leave_matchmaking_queue",
} as const;

export type MatchmakingQueueStatus = "queued" | "matched" | "cancelled" | "expired";

export function isTerminalQueueStatus(status: MatchmakingQueueStatus) {
  return status === "matched" || status === "cancelled" || status === "expired";
}
