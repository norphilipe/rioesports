export type QueueReadiness = {
  authenticated: boolean;
  verifiedIdentity: boolean;
  eligibleGameProfile: boolean;
  activeQueueMode: boolean;
};

export function canJoinCompetitiveQueue(readiness: QueueReadiness) {
  return Object.values(readiness).every(Boolean);
}
