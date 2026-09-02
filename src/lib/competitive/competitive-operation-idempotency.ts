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

export type CompetitiveOperationRecord<T> = {
  key: string;
  status: "pending" | "completed" | "failed";
  result?: T;
};

export function canExecuteCompetitiveOperation<T>(record?: CompetitiveOperationRecord<T> | null) {
  return !record || record.status === "failed";
}
