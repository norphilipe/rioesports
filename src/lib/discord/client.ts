import { getRuntimeEnvValue } from "@/lib/env/runtime";

const DISCORD_API_BASE_URL = "https://discord.com/api/v10";

export class DiscordApiError extends Error {
  constructor(message: string, public readonly status?: number) {
    super(message);
    this.name = "DiscordApiError";
  }
}

async function getConfig() {
  const [token, channelId] = await Promise.all([
    getRuntimeEnvValue("DISCORD_BOT_TOKEN"),
    getRuntimeEnvValue("DISCORD_CHANNEL_ID"),
  ]);
  return { token, channelId };
}

export async function sendDiscordChannelMessage(content: string) {
  const { token, channelId } = await getConfig();
  if (!token || !channelId) return { sent: false, reason: "not_configured" as const };

  const response = await fetch(`${DISCORD_API_BASE_URL}/channels/${encodeURIComponent(channelId)}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bot ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ content }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new DiscordApiError(`Discord message request failed: ${response.status} ${detail}`.slice(0, 500), response.status);
  }

  return { sent: true as const };
}
