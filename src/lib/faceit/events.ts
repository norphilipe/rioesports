export type FaceitEventKind = "match" | "tournament" | "championship" | "hub" | "unknown";

export function classifyFaceitEvent(event: string | null | undefined): FaceitEventKind {
  if (!event) return "unknown";
  const normalized = event.toLowerCase();
  if (normalized.startsWith("match_")) return "match";
  if (normalized.startsWith("tournament_")) return "tournament";
  if (normalized.startsWith("championship_")) return "championship";
  if (normalized.startsWith("hub_")) return "hub";
  return "unknown";
}

export function extractFaceitEntityId(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  const value = payload as Record<string, unknown>;
  for (const key of ["id", "match_id", "tournament_id", "championship_id", "hub_id"]) {
    const candidate = value[key];
    if (typeof candidate === "string" && candidate.length > 0) return candidate;
  }
  return null;
}
