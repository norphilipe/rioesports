import { createClient } from "@/lib/supabase/server";

export type RankingEntry = {
  position: number;
  nickname: string;
  rating: number;
  matches: number;
  wins: number;
};

export async function getCompetitiveRanking(limit = 100): Promise<RankingEntry[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("competitive_profiles")
    .select("nickname,rating,matches_played,wins")
    .order("rating", { ascending: false })
    .limit(limit);

  if (error) throw new Error(`Could not load competitive ranking: ${error.message}`);

  return (data ?? []).map((player, index) => ({
    position: index + 1,
    nickname: player.nickname ?? "Jogador",
    rating: player.rating ?? 0,
    matches: player.matches_played ?? 0,
    wins: player.wins ?? 0,
  }));
}
