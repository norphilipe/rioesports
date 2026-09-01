export type FaceitPlayer = {
  player_id: string;
  nickname: string;
  steam_id_64?: string;
  games?: Record<string, { faceit_elo?: number; skill_level?: number }>;
};

const FACEIT_DATA_API = "https://open.faceit.com/data/v4";

function getFaceitApiKey() {
  const apiKey = process.env.FACEIT_DATA_API_KEY;
  if (!apiKey) throw new Error("FACEIT_DATA_API_KEY is not configured.");
  return apiKey;
}

async function requestFaceitPlayer(game: string, steamId64: string) {
  const url = new URL(`${FACEIT_DATA_API}/players`);
  url.searchParams.set("game", game);
  url.searchParams.set("game_player_id", steamId64);

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${getFaceitApiKey()}`, Accept: "application/json" },
    cache: "no-store",
  });

  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`FACEIT player lookup failed with status ${response.status}.`);
  return response.json() as Promise<FaceitPlayer>;
}

export async function getFaceitPlayerBySteamId(steamId64: string) {
  const current = await requestFaceitPlayer("cs2", steamId64);
  if (current) return current;
  return requestFaceitPlayer("csgo", steamId64);
}
