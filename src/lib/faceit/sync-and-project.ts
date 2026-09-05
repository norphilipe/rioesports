import { synchronizeFaceitEvent, type FaceitSyncResult } from "./sync";
import { queueFaceitMatchProjection } from "./queue-match-projection";

export async function synchronizeAndQueueFaceitEvent(eventType: string | null, payload: unknown): Promise<FaceitSyncResult> {
  const result = await synchronizeFaceitEvent(eventType, payload);
  if (result.entityId && result.action !== "ignored" && eventType?.toLowerCase().startsWith("match_")) {
    await queueFaceitMatchProjection(result.entityId);
  }
  return result;
}
