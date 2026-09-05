import { createClient } from "@/lib/supabase/server";
import type { FaceitMatchProjection } from "./project-match";

export async function storeFaceitMatchProjection(projection: FaceitMatchProjection) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("faceit_match_projections")
    .upsert({
      faceit_match_id: projection.faceitMatchId,
      status: projection.status,
      finished_at: projection.finishedAt,
      winner_team_id: projection.winnerId,
      teams: projection.teams,
      source_updated_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }, { onConflict: "faceit_match_id" });
  if (error) throw error;
}
