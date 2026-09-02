export type CompetitiveOperationKey = {
  scope: string;
  id: string;
  version?: number;
};

export function createCompetitiveOperationKey(input: CompetitiveOperationKey) {
  const scope = input.scope.trim().toLowerCase();
  const id = input.id.trim();

  if (!scope || !id) {
    throw new Error("Competitive operation scope and id are required");
  }

  return [scope, id, input.version ?? 1].join(":");
}

export type CompetitiveOperationStatus = "pending" | "completed" | "failed";

export type CompetitiveOperationRecord<T> = {
  key: string;
  status: CompetitiveOperationStatus;
  result?: T;
  updatedAt?: string;
};

export function canExecuteCompetitiveOperation<T>(record?: CompetitiveOperationRecord<T> | null) {
  return !record || record.status === "failed";
}

export function nextCompetitiveOperationStatus(
  current: CompetitiveOperationStatus,
  succeeded: boolean,
): CompetitiveOperationStatus {
  if (current === "completed") return "completed";
  return succeeded ? "completed" : "failed";
}

export function isCompetitiveOperationTerminal(status: CompetitiveOperationStatus) {
  return status === "completed" || status === "failed";
}
