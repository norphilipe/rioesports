export type CompetitiveOperationKey = {
  scope: string;
  resourceId: string;
  operation: string;
};

export function createCompetitiveOperationKey(input: CompetitiveOperationKey) {
  const values = [input.scope, input.resourceId, input.operation].map((value) => value.trim());

  if (values.some((value) => !value)) {
    throw new Error("Competitive operation key requires scope, resourceId and operation");
  }

  return values.join(":");
}

export function isDuplicateCompetitiveOperation(
  existingKeys: Iterable<string>,
  key: string,
) {
  for (const existingKey of existingKeys) {
    if (existingKey === key) return true;
  }

  return false;
}
