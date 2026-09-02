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

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("display_name,username")
    .eq("id", profileId)
    .maybeSingle();

  if (profileError) throw new Error(profileError.message);
  if (!profile) return null;

  const { data: gameProfile, error: gameProfileError } = await supabase
    .from("player_game_profiles")
    .select("mmr,wins,losses")
    .eq("profile_id", profileId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (gameProfileError) throw new Error(gameProfileError.message);

  const { data: matchPlayers, error: historyError } = await supabase
    .from("match_players")
    .select("won,matches(id,status,finished_at)")
    .eq("profile_id", profileId)
    .order("created_at", { ascending: false })
    .limit(20);

  if (historyError) throw new Error(historyError.message);

  const history = (matchPlayers ?? []).map((item) => {
    const match = Array.isArray(item.matches) ? item.matches[0] : item.matches;
    return {
      id: (match as { id: string } | null)?.id ?? "",
      status: (match as { status?: string } | null)?.status ?? "unknown",
      finishedAt: (match as { finished_at?: string | null } | null)?.finished_at ?? null,
      won: item.won,
    };
  }).filter((item) => item.id);

  const wins = gameProfile?.wins ?? 0;
  const losses = gameProfile?.losses ?? 0;

  return {
    nickname: profile.display_name || profile.username || "Jogador",
    rating: gameProfile?.mmr ?? 1000,
    matches: wins + losses,
    wins,
    history,
  };
}
