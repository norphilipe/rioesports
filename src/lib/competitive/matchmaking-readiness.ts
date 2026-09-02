export type MatchmakingReadiness = {
  queueEnabled: boolean;
  workerAvailable: boolean;
  databaseAvailable: boolean;
  minimumPlayersOnline: boolean;
};

export function canRunMatchmaking(readiness: MatchmakingReadiness) {
  return readiness.queueEnabled && readiness.workerAvailable && readiness.databaseAvailable;
}

export function canFormCompetitiveMatch(readiness: MatchmakingReadiness) {
  return canRunMatchmaking(readiness) && readiness.minimumPlayersOnline;
}
