import type { CompetitiveReadiness } from "./competitive-readiness";

export type CompetitiveRuntimeReadiness = CompetitiveReadiness & {
  persistence: boolean;
  workerRuntime: boolean;
};

export function canRunCompetitiveMatches(readiness: CompetitiveRuntimeReadiness) {
  return Object.values(readiness).every(Boolean);
}
