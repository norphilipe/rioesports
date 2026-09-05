const FACEIT_API_BASE_URL = "https://open.faceit.com/data/v4";

export class FaceitApiError extends Error {
  constructor(message: string, public readonly status?: number) {
    super(message);
    this.name = "FaceitApiError";
  }
}

function getServerApiKey() {
  const apiKey = process.env.FACEIT_SERVER_API_KEY;
  if (!apiKey) throw new FaceitApiError("FACEIT_SERVER_API_KEY is not configured.");
  return apiKey;
}

export async function fetchFaceitResource<T>(path: string): Promise<T> {
  const response = await fetch(`${FACEIT_API_BASE_URL}${path}`, {
    headers: { Authorization: `Bearer ${getServerApiKey()}` },
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
