export type MatchmakingQueueEntry = {
  id: string;
  queue_mode_id: string;
  profile_id: string;
  player_game_profile_id: string;
  rating_snapshot: number;
  status: "queued" | "matched" | "cancelled" | "expired";
  queued_at: string;
  matched_at: string | null;
  cancelled_at: string | null;
};

export type QueueActionResult =
  | { ok: true; entry: MatchmakingQueueEntry }
  | { ok: false; error: string };

export function isActiveQueueEntry(entry: Pick<MatchmakingQueueEntry, "status"> | null | undefined) {
  return entry?.status === "queued";
}
