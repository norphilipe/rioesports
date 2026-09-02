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
  error?: string;
  createdAt?: string;
  updatedAt?: string;
};

export interface CompetitiveOperationStore<T> {
  find(key: string): Promise<CompetitiveOperationRecord<T> | null>;
  create(record: CompetitiveOperationRecord<T>): Promise<CompetitiveOperationRecord<T>>;
  update(record: CompetitiveOperationRecord<T>): Promise<CompetitiveOperationRecord<T>>;
}

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

export async function beginCompetitiveOperation<T>(
  store: CompetitiveOperationStore<T>,
  key: string,
  now = new Date(),
): Promise<{ record: CompetitiveOperationRecord<T>; reused: boolean }> {
  const existing = await store.find(key);

  if (existing && existing.status !== "failed") {
    return { record: existing, reused: true };
  }

  const record: CompetitiveOperationRecord<T> = {
    key,
    status: "pending",
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };

  return { record: await store.create(record), reused: false };
}

export async function completeCompetitiveOperation<T>(
  store: CompetitiveOperationStore<T>,
  record: CompetitiveOperationRecord<T>,
  result: T,
  now = new Date(),
) {
  return store.update({
    ...record,
    status: "completed",
    result,
    error: undefined,
    updatedAt: now.toISOString(),
  });
}

export async function failCompetitiveOperation<T>(
  store: CompetitiveOperationStore<T>,
  record: CompetitiveOperationRecord<T>,
  error: unknown,
  now = new Date(),
) {
  return store.update({
    ...record,
    status: "failed",
    error: error instanceof Error ? error.message : String(error),
    updatedAt: now.toISOString(),
  });
}
