import { classifyFaceitEvent, extractFaceitEntityId } from "./events";

export type FaceitProcessResult = {
  kind: ReturnType<typeof classifyFaceitEvent>;
  entityId: string | null;
  action: "match_finished" | "match_changed" | "tournament_changed" | "championship_changed" | "hub_changed" | "ignored";
};

export function planFaceitEvent(eventType: string | null, payload: unknown): FaceitProcessResult {
  const kind = classifyFaceitEvent(eventType);
  const normalized = eventType?.toLowerCase() ?? "";
  const entityId = extractFaceitEntityId(payload);

  if (kind === "match") {
    return { kind, entityId, action: normalized === "match_finished" ? "match_finished" : "match_changed" };
  }
  if (kind === "tournament") return { kind, entityId, action: "tournament_changed" };
  if (kind === "championship") return { kind, entityId, action: "championship_changed" };
  if (kind === "hub") return { kind, entityId, action: "hub_changed" };
  return { kind, entityId, action: "ignored" };
}
