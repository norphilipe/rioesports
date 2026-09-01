export type MatchmakingFormationResult = {
  formed: boolean;
  matchId: string | null;
};

type MatchmakingWorkerClient = {
  rpc: (name: string, args: { p_queue_mode_id: string }) => Promise<{
    data: string | null;
    error: { message: string } | null;
  }>;
};

export async function attemptMatchFormation(
  client: MatchmakingWorkerClient,
  queueModeId: string,
): Promise<MatchmakingFormationResult> {
  const { data, error } = await client.rpc("form_matchmaking_match", {
    p_queue_mode_id: queueModeId,
  });

  if (error) {
    throw new Error(error.message);
  }

  return { formed: Boolean(data), matchId: data };
}
