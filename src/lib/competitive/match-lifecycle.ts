export type CompetitiveMatchLifecycle = {
  id: string;
  status: string;
  serverStatus: "unassigned" | "provisioning" | "ready" | "failed" | "released";
  serverEndpoint: string | null;
  readyAt: string | null;
  startedAt: string | null;
  completedAt: string | null;
};

export function isMatchReady(match: CompetitiveMatchLifecycle) {
  return match.serverStatus === "ready" && Boolean(match.serverEndpoint);
}
