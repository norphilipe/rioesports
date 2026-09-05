import { fetchFaceitChampionship, fetchFaceitHub, fetchFaceitMatch, fetchFaceitTournament } from "./api";
import { classifyFaceitEvent } from "./events";
import { planFaceitEvent } from "./process-event";
import { storeFaceitResource } from "./store-resource";

export type FaceitSyncResult = {
  action: string;
  entityId: string | null;
  resource: unknown | null;
};

export async function synchronizeFaceitEvent(eventType: string | null, payload: unknown): Promise<FaceitSyncResult> {
  const plan = planFaceitEvent(eventType, payload);
  if (!plan.entityId || plan.action === "ignored") {
    return { action: plan.action, entityId: plan.entityId, resource: null };
  }

  let resource: unknown;
  if (plan.kind === "match") resource = await fetchFaceitMatch(plan.entityId);
  else if (plan.kind === "tournament") resource = await fetchFaceitTournament(plan.entityId);
  else if (plan.kind === "championship") resource = await fetchFaceitChampionship(plan.entityId);
  else if (plan.kind === "hub") resource = await fetchFaceitHub(plan.entityId);
  else return { action: "ignored", entityId: plan.entityId, resource: null };

  const kind = classifyFaceitEvent(eventType);
  if (kind !== "unknown") {
    await storeFaceitResource(kind, plan.entityId, resource, eventType);
  }

  return { action: plan.action, entityId: plan.entityId, resource };
}
