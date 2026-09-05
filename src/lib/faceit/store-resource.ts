import { createClient } from "@/lib/supabase/server";
import type { FaceitEventKind } from "./events";

export async function storeFaceitResource(
  resourceType: Exclude<FaceitEventKind, "unknown">,
  faceitId: string,
  payload: unknown,
  sourceEvent: string | null,
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("faceit_resources")
    .upsert({
      resource_type: resourceType,
      faceit_id: faceitId,
      payload,
      source_event: sourceEvent,
      last_synced_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }, { onConflict: "resource_type,faceit_id" });

  if (error) throw error;
}
