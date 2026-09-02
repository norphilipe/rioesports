export type ExternalMatchEvidence =
  | { type: "demo"; storagePath: string; uploadedAt: string }
  | { type: "manual"; submittedAt: string; submittedBy: string };

export function canAutomaticallyVerifyExternalMatch(
  evidence: ExternalMatchEvidence | null | undefined,
) {
  return evidence?.type === "demo";
}

export function requiresCaptainConfirmation(
  evidence: ExternalMatchEvidence | null | undefined,
) {
  return !canAutomaticallyVerifyExternalMatch(evidence);
}
