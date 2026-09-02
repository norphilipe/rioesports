import type { MatchRatingChange } from "./rating-engine";

type RatingRpcClient = {
  rpc: (name: string, args: Record<string, string | number>) => Promise<{
    data: unknown;
    error: { message: string } | null;
  }>;
};

export async function persistCompetitiveRatingChange(
  client: RatingRpcClient,
  input: {
    profileId: string;
    gameId: string;
    matchId: string;
    change: MatchRatingChange;
  },
) {
  const { error } = await client.rpc("apply_competitive_rating_change", {
    p_profile_id: input.profileId,
    p_game_id: input.gameId,
    p_match_id: input.matchId,
    p_previous_mmr: input.change.previousMmr,
    p_new_mmr: input.change.newMmr,
    p_reason: "match_result",
  });

  if (error) throw new Error(error.message);
}
