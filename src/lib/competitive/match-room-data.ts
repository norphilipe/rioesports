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

  const { data: players } = await supabase
    .from("match_players")
    .select("team_side,profile:profiles(nickname)")
    .eq("match_id", matchId);

  const teamA = (players ?? []).filter((p) => p.team_side === "A").map((p) => (p.profile as { nickname?: string } | null)?.nickname ?? "Jogador");
  const teamB = (players ?? []).filter((p) => p.team_side === "B").map((p) => (p.profile as { nickname?: string } | null)?.nickname ?? "Jogador");

  const statusMap: Record<string, MatchRoomData["state"]> = {
    created: "pending",
    ready: "ready",
    active: "in_progress",
    finished: "completed",
  };

  return { state: statusMap[match.status] ?? "awaiting_result", teamA, teamB };
}
