export type CompetitiveCycleExecutionReport = {
  startedAt: string;
  finishedAt: string;
  stage: string;
  ok: boolean;
  matchId?: string | null;
  failure?: { stage: string; message: string } | null;
};

export function createCompetitiveCycleExecutionReport(input: {
  startedAt: Date;
  stage: string;
  ok: boolean;
  matchId?: string | null;
  failure?: { stage: string; message: string } | null;
  finishedAt?: Date;
}): CompetitiveCycleExecutionReport {
  const finishedAt = input.finishedAt ?? new Date();

  return {
    startedAt: input.startedAt.toISOString(),
    finishedAt: finishedAt.toISOString(),
    stage: input.stage,
    ok: input.ok,
    matchId: input.matchId ?? null,
    failure: input.failure ?? null,
  };
}
