import { createClient } from "@/lib/supabase/server";

const RATING_DELTA = 25;

export async function applyMatchRating(matchId: string) {
  const supabase = await createClient();
  const { data: players, error } = await supabase
    .from("match_players")
    .select("profile_id,won")
    .eq("match_id", matchId);

  if (error) throw new Error(error.message);

  for (const player of players ?? []) {
    if (typeof player.won !== "boolean") continue;
    const { data: profile, error: profileError } = await supabase
      .from("competitive_profiles")
      .select("rating,matches_played,wins")
      .eq("profile_id", player.profile_id)
      .single();
    if (profileError || !profile) continue;

    const delta = player.won ? RATING_DELTA : -RATING_DELTA;
    const nextRating = Math.max(0, (profile.rating ?? 0) + delta);

    await supabase
      .from("competitive_profiles")
      .update({
        rating: nextRating,
        matches_played: (profile.matches_played ?? 0) + 1,
        wins: (profile.wins ?? 0) + (player.won ? 1 : 0),
      })
      .eq("profile_id", player.profile_id);
  }
}
