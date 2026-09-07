"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function setQueueModeActive(formData: FormData) {
  const queueModeId = String(formData.get("queueModeId") ?? "");
  const nextActive = String(formData.get("nextActive") ?? "") === "true";
  if (!queueModeId) throw new Error("queue mode is required");

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("authentication required");

  const { data: isAdmin } = await supabase.rpc("is_current_platform_admin");
  if (!isAdmin) throw new Error("administrator access required");

  const { error } = await supabase.from("queue_modes").update({ is_active: nextActive }).eq("id", queueModeId);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/matchmaking");
}
