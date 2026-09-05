type JsonRecord = Record<string, unknown>;

export type FaceitMatchProjection = {
  faceitMatchId: string;
  status: string | null;
  finishedAt: string | null;
  winnerId: string | null;
  teams: Array<{ id: string; name: string | null; score: number | null }>;
};

function asRecord(value: unknown): JsonRecord | null {
  return value && typeof value === "object" && !Array.isArray(value) ? value as JsonRecord : null;
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function asNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export function projectFaceitMatch(resource: unknown): FaceitMatchProjection | null {
  const match = asRecord(resource);
  if (!match) return null;
  const faceitMatchId = asString(match.match_id) ?? asString(match.id);
  if (!faceitMatchId) return null;

  const teamsRecord = asRecord(match.teams) ?? {};
  const results = asRecord(match.results);
  const scores = asRecord(results?.score);
  const teams = Object.values(teamsRecord)
    .map((team) => {
      const value = asRecord(team);
      if (!value) return null;
      const id = asString(value.team_id) ?? asString(value.id);
      if (!id) return null;
      const score = scores ? asNumber(scores[id]) : null;
      return { id, name: asString(value.nickname) ?? asString(value.name), score };
    })
    .filter((team): team is { id: string; name: string | null; score: number | null } => team !== null);

  return {
    faceitMatchId,
    status: asString(match.status),
    finishedAt: asString(match.finished_at),
    winnerId: asString(results?.winner),
    teams,
  };
}
