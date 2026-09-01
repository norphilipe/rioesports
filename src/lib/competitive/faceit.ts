import type { CompetitiveIdentity } from "./identity";

export type FaceitSyncResult =
  | { ok: true; identity: CompetitiveIdentity }
  | { ok: false; reason: "not_configured" | "not_found" | "provider_error" };

export function canSyncFaceit() {
  return Boolean(process.env.FACEIT_DATA_API_KEY);
}

export function normalizeFaceitNickname(value: string) {
  return value.trim();
}
