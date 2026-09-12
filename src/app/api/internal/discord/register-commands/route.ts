import { NextRequest, NextResponse } from "next/server";
import { getRuntimeEnvValue } from "@/lib/env/runtime";

const DISCORD_API_BASE_URL = "https://discord.com/api/v10";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function POST(request: NextRequest) {
  const expected = await getRuntimeEnvValue("FACEIT_PROCESSOR_SECRET");
  const authorization = request.headers.get("authorization");
  if (!expected || authorization !== `Bearer ${expected}`) return unauthorized();

  const [token, applicationId, guildId] = await Promise.all([
    getRuntimeEnvValue("DISCORD_BOT_TOKEN"),
    getRuntimeEnvValue("DISCORD_APPLICATION_ID"),
    getRuntimeEnvValue("DISCORD_GUILD_ID"),
  ]);

  if (!token || !applicationId || !guildId) {
    return NextResponse.json({ error: "Discord command registration is not configured." }, { status: 503 });
  }

  const commands = [
    {
      name: "partida",
      description: "Consulta uma partida da FACEIT",
      options: [
        {
          type: 3,
          name: "match_id",
          description: "ID da partida na FACEIT",
          required: true,
        },
      ],
    },
    {
      name: "campeonato",
      description: "Consulta um campeonato da FACEIT",
      options: [
        {
          type: 3,
          name: "championship_id",
          description: "ID do campeonato na FACEIT",
          required: true,
        },
      ],
    },
  ];

  const response = await fetch(`${DISCORD_API_BASE_URL}/applications/${encodeURIComponent(applicationId)}/guilds/${encodeURIComponent(guildId)}/commands`, {
    method: "PUT",
    headers: {
      Authorization: `Bot ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(commands),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    console.error("Discord command registration failed", response.status, detail);
    return NextResponse.json({ error: "Discord command registration failed." }, { status: 502 });
  }

  return NextResponse.json({ registered: true, commands: commands.map((command) => command.name) });
}
