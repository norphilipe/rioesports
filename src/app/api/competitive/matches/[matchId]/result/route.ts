import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { applyConfirmedExternalResult } from "@/lib/competitive/apply-confirmed-external-result";

export async function POST(request: Request, { params }: { params: Promise<{ matchId: string }> }) {
  const { matchId } = await params;
  const body = await request.json();
  const winnerTeamId = typeof body.winnerTeamId === "string" ? body.winnerTeamId : null;
  const loserTeamId = typeof body.loserTeamId === "string" ? body.loserTeamId : null;
  const winnerScore = Number(body.winnerScore);
  const loserScore = Number(body.loserScore);

  if (!winnerTeamId || !loserTeamId || winnerTeamId === loserTeamId || !Number.isInteger(winnerScore) || !Number.isInteger(loserScore) || winnerScore < 0 || loserScore < 0 || winnerScore === loserScore || winnerScore < loserScore) {
    return NextResponse.json({ error: "Invalid match result" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: participant, error: participantError } = await supabase
    .from("match_players")
    .select("profile_id,team_side")
    .eq("match_id", matchId)
    .eq("profile_id", user.id)
    .maybeSingle();
  if (participantError) return NextResponse.json({ error: participantError.message }, { status: 500 });
  if (!participant) return NextResponse.json({ error: "Only match participants can submit a result" }, { status: 403 });

  const { data: teams, error: teamsError } = await supabase
    .from("match_teams")
    .select("id,side")
    .eq("match_id", matchId);
  if (teamsError) return NextResponse.json({ error: teamsError.message }, { status: 500 });
  const winner = (teams ?? []).find((team) => team.id === winnerTeamId);
  const loser = (teams ?? []).find((team) => team.id === loserTeamId);
  if (!winner || !loser) return NextResponse.json({ error: "Submitted teams do not belong to this match" }, { status: 400 });

  const { error } = await supabase.from("external_match_result_submissions").upsert({
    match_id: matchId,
    submitted_by: user.id,
    winner_team_id: winnerTeamId,
    loser_team_id: loserTeamId,
    winner_score: winnerScore,
    loser_score: loserScore,
    submitted_at: new Date().toISOString(),
  }, { onConflict: "match_id,submitted_by" });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: submissions, error: submissionsError } = await supabase
    .from("external_match_result_submissions")
    .select("submitted_by,winner_team_id,loser_team_id,winner_score,loser_score")
    .eq("match_id", matchId);
  if (submissionsError) return NextResponse.json({ error: submissionsError.message }, { status: 500 });

  const matching = (submissions ?? []).filter((submission) =>
    submission.winner_team_id === winnerTeamId &&
    submission.loser_team_id === loserTeamId &&
    submission.winner_score === winnerScore &&
    submission.loser_score === loserScore,
  );

  const submitterIds = matching.map((submission) => submission.submitted_by);
  const { data: confirmingPlayers, error: confirmingPlayersError } = submitterIds.length
    ? await supabase.from("match_players").select("profile_id,team_side").eq("match_id", matchId).in("profile_id", submitterIds)
    : { data: [], error: null };
  if (confirmingPlayersError) return NextResponse.json({ error: confirmingPlayersError.message }, { status: 500 });

  const confirmingSides = new Set((confirmingPlayers ?? []).map((player) => player.team_side));
  const status = confirmingSides.has(winner.side) && confirmingSides.has(loser.side)
    ? "confirmed"
    : (submissions?.length ?? 0) >= 2 ? "conflict" : "pending";

  if (status === "confirmed") {
    try {
      await applyConfirmedExternalResult(matchId);
    } catch (applyError) {
      const message = applyError instanceof Error ? applyError.message : "Could not apply confirmed result";
      return NextResponse.json({ error: message, status }, { status: 500 });
    }
  }

  return NextResponse.json({ matchId, status, confirmations: confirmingSides.size });
}
