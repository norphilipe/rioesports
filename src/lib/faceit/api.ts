import { requireRuntimeEnvValue } from "@/lib/env/runtime";

const FACEIT_API_BASE_URL = "https://open.faceit.com/data/v4";

export class FaceitApiError extends Error {
  constructor(message: string, public readonly status?: number) {
    super(message);
    this.name = "FaceitApiError";
  }
}

async function getServerApiKey() {
  const configured = await requireRuntimeEnvValue("FACEIT_SERVER_API_KEY").catch(async () => {
    return requireRuntimeEnvValue("FACEIT_API_KEY");
  });
  return configured;
}

export async function fetchFaceitResource<T>(path: string): Promise<T> {
  const response = await fetch(`${FACEIT_API_BASE_URL}${path}`, {
    headers: { Authorization: `Bearer ${await getServerApiKey()}` },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new FaceitApiError(`FACEIT API request failed for ${path}.`, response.status);
  }

  return response.json() as Promise<T>;
}

export function fetchFaceitMatch(matchId: string) {
  return fetchFaceitResource(`/matches/${encodeURIComponent(matchId)}`);
}

export function fetchFaceitTournament(tournamentId: string) {
  return fetchFaceitResource(`/tournaments/${encodeURIComponent(tournamentId)}`);
}

export function fetchFaceitChampionship(championshipId: string) {
  return fetchFaceitResource(`/championships/${encodeURIComponent(championshipId)}`);
}

export function fetchFaceitHub(hubId: string) {
  return fetchFaceitResource(`/hubs/${encodeURIComponent(hubId)}`);
}
