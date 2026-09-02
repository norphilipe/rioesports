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
      .maybeSingle();

    if (profileError) throw new Error(profileError.message);

    const currentRating = profile?.rating ?? 1000;
    const currentMatches = profile?.matches_played ?? 0;
    const currentWins = profile?.wins ?? 0;
    const delta = player.won ? RATING_DELTA : -RATING_DELTA;

    const { error: upsertError } = await supabase
      .from("competitive_profiles")
      .upsert({
        profile_id: player.profile_id,
        rating: Math.max(0, currentRating + delta),
        matches_played: currentMatches + 1,
        wins: currentWins + (player.won ? 1 : 0),
        updated_at: new Date().toISOString(),
      }, { onConflict: "profile_id" });

    if (upsertError) throw new Error(upsertError.message);
  }
}
