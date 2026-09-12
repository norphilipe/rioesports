export type FaceitEventKind = "match" | "tournament" | "championship" | "hub" | "unknown";

export function classifyFaceitEvent(event: string | null | undefined): FaceitEventKind {
  if (!event) return "unknown";
  const normalized = event.trim().toLowerCase();
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

  // Keep compatibility with payloads that wrap the resource in a data/object field.
  for (const key of ["data", "object", "resource"]) {
    const nested = value[key];
    const nestedId = extractFaceitEntityId(nested);
    if (nestedId) return nestedId;
  }

  return null;
}
