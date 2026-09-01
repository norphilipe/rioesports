export type CompetitiveWorkerConfig = {
  pollIntervalMs: number;
  enabled: boolean;
};

export const DEFAULT_COMPETITIVE_WORKER_CONFIG: CompetitiveWorkerConfig = {
  pollIntervalMs: 10_000,
  enabled: true,
};

export function validateWorkerConfig(config: CompetitiveWorkerConfig) {
  if (!Number.isFinite(config.pollIntervalMs) || config.pollIntervalMs < 1_000) {
    throw new Error("pollIntervalMs must be at least 1000ms");
  }
}
