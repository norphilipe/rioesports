export type CompetitiveProductionGates = {
  persistence: boolean;
  workerRuntime: boolean;
  serverProvisioning: boolean;
  resultIngestion: boolean;
  ratingPersistence: boolean;
  monitoring: boolean;
};

export function listClosedProductionGates(gates: CompetitiveProductionGates) {
  return Object.entries(gates)
    .filter(([, open]) => !open)
    .map(([gate]) => gate);
}

export function isCompetitiveProductionReady(gates: CompetitiveProductionGates) {
  return listClosedProductionGates(gates).length === 0;
}
