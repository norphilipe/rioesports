import { fetchFaceitChampionship, fetchFaceitHub, fetchFaceitMatch, fetchFaceitTournament } from "./api";
import { planFaceitEvent } from "./process-event";

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

  if (plan.kind === "match") {
    return { action: plan.action, entityId: plan.entityId, resource: await fetchFaceitMatch(plan.entityId) };
  }
  if (plan.kind === "tournament") {
    return { action: plan.action, entityId: plan.entityId, resource: await fetchFaceitTournament(plan.entityId) };
  }
  if (plan.kind === "championship") {
    return { action: plan.action, entityId: plan.entityId, resource: await fetchFaceitChampionship(plan.entityId) };
  }
  if (plan.kind === "hub") {
    return { action: plan.action, entityId: plan.entityId, resource: await fetchFaceitHub(plan.entityId) };
  }

  return { action: "ignored", entityId: plan.entityId, resource: null };
}
