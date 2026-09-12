import { fetchFaceitMatch } from "@/lib/faceit/api";
import { sendDiscordChannelMessage } from "@/lib/discord/client";

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function stringValue(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function formatMatchMessage(match: unknown, finished: boolean) {
  const value = asRecord(match);
  const teams = Array.isArray(value.teams) ? value.teams : [];
  const results = asRecord(value.results);
  const score = asRecord(results.score);
  const teamLines = teams.slice(0, 2).map((team, index) => {
    const item = asRecord(team);
    const teamId = stringValue(item.team_id ?? item.id, `team-${index + 1}`);
    const name = stringValue(item.name ?? item.nickname, `Time ${index + 1}`);
    const teamScore = typeof score[teamId] === "number" || typeof score[teamId] === "string" ? String(score[teamId]) : "?";
    return `${name} **${teamScore}**`;
  });

  const fallbackTeams = teamLines.length === 2 ? teamLines : ["Time 1 **?**", "Time 2 **?**"];
  const winnerId = typeof results.winner === "string" ? results.winner : null;
  const winnerName = teams.map(asRecord).find((team) => String(team.team_id ?? team.id ?? "") === winnerId)?.name;
  const faceitUrl = stringValue(value.faceit_url, "https://www.faceit.com/");

  if (finished) {
    return [
      "🏆 **Partida finalizada**",
      `${fallbackTeams[0]} × ${fallbackTeams[1]}`,
      winnerName ? `🥇 Vencedor: **${winnerName}**` : "",
      `🔗 ${faceitUrl}`,
    ].filter(Boolean).join("\n");
  }

  return [
    "🎮 **Nova partida na FACEIT**",
    `${fallbackTeams[0]} × ${fallbackTeams[1]}`,
    `🔗 ${faceitUrl}`,
  ].join("\n");
}

export async function notifyRjvalsMatch(matchId: string, finished: boolean) {
  const match = await fetchFaceitMatch(matchId);
  const message = formatMatchMessage(match, finished);
  return sendDiscordChannelMessage(message);
}
