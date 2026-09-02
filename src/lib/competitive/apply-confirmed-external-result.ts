import { createClient } from "@/lib/supabase/server";
import { applyMatchRating } from "./apply-match-rating";

export async function applyConfirmedExternalResult(matchId: string) {
  const supabase = await createClient();
  const { data: submissions, error: submissionsError } = await supabase.from("external_match_result_submissions").select("winner_team_id,loser_team_id,winner_score,loser_score").eq("match_id", matchId);
  if (submissionsError) throw new Error(submissionsError.message);

  const first = submissions?.[0];
  const confirmed = first && (submissions ?? []).filter((item) => item.winner_team_id === first.winner_team_id && item.loser_team_id === first.loser_team_id && item.winner_score === first.winner_score && item.loser_score === first.loser_score).length >= 2;
  if (!confirmed) throw new Error("External match result is not confirmed");

  const { data: match } = await supabase.from("matches").select("status").eq("id", matchId).single();
  if (match?.status === "finished") return { matchId, applied: true, alreadyApplied: true };

  const { data: teams, error: teamsError } = await supabase.from("match_teams").select("id,side").eq("match_id", matchId);
  if (teamsError || !teams) throw new Error(teamsError?.message ?? "Match teams not found");

  const winner = teams.find((team) => team.id === first.winner_team_id);
  const loser = teams.find((team) => team.id === first.loser_team_id);
  if (!winner || !loser) throw new Error("Submitted teams do not belong to this match");

  const { error: winnerError } = await supabase.from("match_teams").update({ score: first.winner_score, won: true }).eq("id", winner.id);
  if (winnerError) throw new Error(winnerError.message);
  const { error: loserError } = await supabase.from("match_teams").update({ score: first.loser_score, won: false }).eq("id", loser.id);
  if (loserError) throw new Error(loserError.message);

  const { error: playersError } = await supabase.from("match_players").update({ won: true }).eq("match_id", matchId).eq("team_side", winner.side);
  if (playersError) throw new Error(playersError.message);
  const { error: losingPlayersError } = await supabase.from("match_players").update({ won: false }).eq("match_id", matchId).eq("team_side", loser.side);
  if (losingPlayersError) throw new Error(losingPlayersError.message);

  await applyMatchRating(matchId);

  const { error: matchError } = await supabase.from("matches").update({ status: "finished", finished_at: new Date().toISOString() }).eq("id", matchId).neq("status", "finished");
  if (matchError) throw new Error(matchError.message);

  return { matchId, winnerTeamId: winner.id, loserTeamId: loser.id, applied: true };
}
