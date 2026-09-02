import { canAutomaticallyVerifyExternalMatch, type ExternalMatchEvidence } from "./external-match-evidence";
import { canVerifyManualExternalResult, type ExternalMatchConfirmation } from "./external-match-confirmation";
import type { ExternalMatchResult } from "./external-match-result";

export function isExternalMatchResultVerified(input: {
  evidence: ExternalMatchEvidence | null | undefined;
  result: ExternalMatchResult;
  confirmations?: ExternalMatchConfirmation[];
}) {
  if (input.result.source === "demo") {
    return canAutomaticallyVerifyExternalMatch(input.evidence) && input.result.verified;
  }

  return canVerifyManualExternalResult(
    input.result,
    input.confirmations ?? [],
  );
}

export function assertExternalMatchResultVerified(input: {
  evidence: ExternalMatchEvidence | null | undefined;
  result: ExternalMatchResult;
  confirmations?: ExternalMatchConfirmation[];
}) {
  if (!isExternalMatchResultVerified(input)) {
    throw new Error("External match result has not been verified");
  }
}
