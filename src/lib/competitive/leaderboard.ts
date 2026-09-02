import { createClient } from "@/lib/supabase/server";

export type LeaderboardEntry = {
  position: number;
  nickname: string;
  rating: number;
  matches: number;
  wins: number;
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

  return (players ?? []).map((player, index) => {
    const profile = Array.isArray(player.profile) ? player.profile[0] : player.profile;
    const details = profile as { display_name?: string | null; username?: string | null } | null;
    const wins = player.wins ?? 0;
    const losses = player.losses ?? 0;
    return {
      position: index + 1,
      nickname: details?.display_name || details?.username || "Jogador",
      rating: player.mmr ?? 0,
      matches: wins + losses,
      wins,
    };
  });
}
