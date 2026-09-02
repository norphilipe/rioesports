import { createClient } from "@/lib/supabase/server";

export type MatchRoomData = {
  state: "pending" | "ready" | "in_progress" | "awaiting_result" | "completed" | "disputed";
  teamA: string[];
  teamB: string[];
};

export async function getMatchRoomData(matchId: string): Promise<MatchRoomData | null> {
  const supabase = await createClient();
  const { data: match } = await supabase.from("matches").select("status").eq("id", matchId).single();
  if (!match) return null;

  const { data: players } = await supabase.from("match_players").select("team_side,profile:profiles(display_name,username)").eq("match_id", matchId);
  const nameOf = (profile: unknown) => {
    const item = Array.isArray(profile) ? profile[0] : profile as { display_name?: string; username?: string } | null;
    return item?.display_name ?? item?.username ?? "Jogador";
  };
  const teamA = (players ?? []).filter((p) => p.team_side === "team_a").map((p) => nameOf(p.profile));
  const teamB = (players ?? []).filter((p) => p.team_side === "team_b").map((p) => nameOf(p.profile));

  const statusMap: Record<string, MatchRoomData["state"]> = { pending: "pending", ready: "ready", live: "in_progress", finished: "completed" };
  return { state: statusMap[match.status] ?? "awaiting_result", teamA, teamB };
}
