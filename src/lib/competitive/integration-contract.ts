export const COMPETITIVE_INTEGRATION_STAGES = [
  "identity",
  "queue",
  "match",
  "server",
  "result",
  "rating",
] as const;

export type CompetitiveIntegrationStage =
  (typeof COMPETITIVE_INTEGRATION_STAGES)[number];

export function isFinalCompetitiveStage(stage: CompetitiveIntegrationStage) {
  return stage === "rating";
}
