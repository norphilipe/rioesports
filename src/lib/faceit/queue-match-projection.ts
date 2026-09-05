import { createClient } from "@/lib/supabase/server";

export async function queueFaceitMatchProjection(faceitMatchId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("faceit_projection_jobs")
    .upsert({ faceit_match_id: faceitMatchId, job_type: "match_projection", status: "pending" }, { onConflict: "faceit_match_id,job_type" });
  if (error) throw error;
}
