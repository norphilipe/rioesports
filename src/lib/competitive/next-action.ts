import type { CompetitiveIntegrationStage } from "./integration-contract";

const NEXT_STAGE: Record<CompetitiveIntegrationStage, CompetitiveIntegrationStage | null> = {
  identity: "queue",
  queue: "match",
  match: "server",
  server: "result",
  result: "rating",
  rating: null,
};

export function nextCompetitiveIntegrationStage(stage: CompetitiveIntegrationStage) {
  return NEXT_STAGE[stage];
}
