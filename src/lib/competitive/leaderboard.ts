import { createClient } from "@/lib/supabase/server";

export type LeaderboardEntry = {
  profileId: string;
  name: string;
  username: string | null;
  mmr: number;
  wins: number;
  losses: number;
};

export async function getCompetitiveLeaderboard(limit = 100): Promise<LeaderboardEntry[]> {
  const supabase = await createClient();
  const { data: players, error } = await supabase
    .from("player_game_profiles")
    .select("profile_id,mmr,wins,losses,profile:profiles(display_name,username)")
    .order("mmr", { ascending: false })
    .order("wins", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);

  return (players ?? []).map((player) => {
    const profile = Array.isArray(player.profile) ? player.profile[0] : player.profile;
    const details = profile as { display_name?: string | null; username?: string | null } | null;
    return {
      profileId: player.profile_id,
      name: details?.display_name || details?.username || "Jogador",
      username: details?.username ?? null,
      mmr: player.mmr ?? 0,
      wins: player.wins ?? 0,
      losses: player.losses ?? 0,
    };
  });
}
