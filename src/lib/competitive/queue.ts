import type { MatchmakingQueueEntry, QueueActionResult } from "./matchmaking";

export async function joinCompetitiveQueue(
  client: { rpc: (name: string, args: Record<string, string>) => Promise<{ data: MatchmakingQueueEntry | null; error: { message: string } | null }> },
  queueModeId: string,
  playerGameProfileId: string,
): Promise<QueueActionResult> {
  const { data, error } = await client.rpc("join_matchmaking_queue", {
    p_queue_mode_id: queueModeId,
    p_player_game_profile_id: playerGameProfileId,
  });

  if (error || !data) {
    return { ok: false, error: error?.message ?? "Não foi possível entrar na fila." };
  }

  return { ok: true, entry: data };
}

export async function leaveCompetitiveQueue(
  client: { rpc: (name: string, args: Record<string, string>) => Promise<{ data: MatchmakingQueueEntry | null; error: { message: string } | null }> },
  queueEntryId: string,
): Promise<QueueActionResult> {
  const { data, error } = await client.rpc("leave_matchmaking_queue", {
    p_queue_entry_id: queueEntryId,
  });

  if (error || !data) {
    return { ok: false, error: error?.message ?? "Não foi possível sair da fila." };
  }

  return { ok: true, entry: data };
}
