import { createClient } from "@/lib/supabase/server";

export type CompetitiveMatchHistoryItem = {
  id: string;
  status: string;
  finishedAt: string | null;
  won: boolean | null;
};

export type PlayerCompetitiveProfile = {
  nickname: string;
  rating: number;
  matches: number;
  wins: number;
  history: CompetitiveMatchHistoryItem[];
};

export async function getPlayerCompetitiveProfile(profileId: string): Promise<PlayerCompetitiveProfile | null> {
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("competitive_profiles")
    .select("nickname,rating,matches_played,wins")
    .eq("profile_id", profileId)
    .single();

  if (!profile) return null;

  const { data: matchPlayers } = await supabase
    .from("match_players")
    .select("won,matches(id,status,finished_at)")
    .eq("profile_id", profileId)
    .order("created_at", { ascending: false })
    .limit(20);

  const history = (matchPlayers ?? []).map((item) => {
    const match = Array.isArray(item.matches) ? item.matches[0] : item.matches;
    return {
      id: (match as { id: string } | null)?.id ?? "",
      status: (match as { status?: string } | null)?.status ?? "unknown",
      finishedAt: (match as { finished_at?: string | null } | null)?.finished_at ?? null,
      won: item.won,
    };
  }).filter((item) => item.id);

  return {
    nickname: profile.nickname ?? "Jogador",
    rating: profile.rating ?? 0,
    matches: profile.matches_played ?? 0,
    wins: profile.wins ?? 0,
    history,
  };
}
