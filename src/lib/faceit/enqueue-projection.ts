import { createClient } from "@/lib/supabase/server";

export async function enqueueFaceitMatchProjection(faceitMatchId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("faceit_projection_jobs")
    .upsert({
      faceit_match_id: faceitMatchId,
      job_type: "match_projection",
      status: "pending",
    }, { onConflict: "faceit_match_id,job_type", ignoreDuplicates: true });

  if (error) throw error;
}
