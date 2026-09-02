import { createClient } from "@/lib/supabase/server";
import type { ExternalMatchResult, ExternalMatchVerification } from "./external-match-result-workflow";

export async function persistVerifiedExternalMatchResult(
  result: ExternalMatchResult,
  verification: ExternalMatchVerification,
) {
  if (!verification.verified) {
    throw new Error("External match result must be verified before persistence");
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("external_match_results")
    .upsert({
      match_id: result.matchId,
      winner_team_id: result.winnerTeamId,
      loser_team_id: result.loserTeamId,
      winner_score: result.winnerScore,
      loser_score: result.loserScore,
      verification_method: verification.method,
      status: "verified",
      evidence:
        verification.method === "captain_confirmation"
          ? { confirmations: verification.confirmations }
          : { source: "demo" },
      verified_at: new Date().toISOString(),
    }, { onConflict: "match_id" })
    .select("id, match_id, status")
    .single();

  if (error) throw new Error(`Could not persist external match result: ${error.message}`);
  return data;
}

export async function markExternalMatchResultApplied(matchId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("external_match_results")
    .update({ status: "applied", applied_at: new Date().toISOString() })
    .eq("match_id", matchId)
    .eq("status", "verified");

  if (error) throw new Error(`Could not mark external match result as applied: ${error.message}`);
}
