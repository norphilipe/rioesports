import { NextRequest, NextResponse } from "next/server";
import { getRuntimeEnvValue } from "@/lib/env/runtime";
import { fetchFaceitChampionship, fetchFaceitMatch } from "@/lib/faceit/api";
import { verifyDiscordInteractionSignature } from "@/lib/discord/interactions";

const DISCORD_PING = 1;
const DISCORD_APPLICATION_COMMAND = 2;

function jsonResponse(content: string, ephemeral = false) {
  return NextResponse.json({
    type: 4,
    data: {
      content,
      ...(ephemeral ? { flags: 64 } : {}),
    },
  });
}

function optionValue(options: unknown, name: string) {
  if (!Array.isArray(options)) return null;
  const option = options.find((item) => item && typeof item === "object" && (item as Record<string, unknown>).name === name) as Record<string, unknown> | undefined;
  return typeof option?.value === "string" ? option.value : null;
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const publicKey = await getRuntimeEnvValue("DISCORD_PUBLIC_KEY");
  if (!publicKey) return NextResponse.json({ error: "Discord public key is not configured." }, { status: 503 });

  const valid = await verifyDiscordInteractionSignature(
    body,
    request.headers.get("x-signature-ed25519"),
    request.headers.get("x-signature-timestamp"),
    publicKey,
  );
  if (!valid) return NextResponse.json({ error: "Invalid request signature." }, { status: 401 });

  let interaction: Record<string, unknown>;
  try {
    interaction = JSON.parse(body) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const type = interaction.type;
  if (type === DISCORD_PING) return NextResponse.json({ type: DISCORD_PING });
  if (type !== DISCORD_APPLICATION_COMMAND) return jsonResponse("Tipo de interação não suportado.", true);

  const command = typeof interaction.data === "object" && interaction.data ? interaction.data as Record<string, unknown> : {};
  const name = typeof command.name === "string" ? command.name : "";
  const matchId = optionValue(command.options, "match_id");
  const championshipId = optionValue(command.options, "championship_id");

  try {
    if (name === "partida" && matchId) {
      const match = await fetchFaceitMatch(matchId);
      const value = match as Record<string, unknown>;
      const url = typeof value.faceit_url === "string" ? value.faceit_url : "https://www.faceit.com/";
      const nameValue = typeof value.competition_name === "string" ? value.competition_name : "Partida FACEIT";
      return jsonResponse(`🎮 **${nameValue}**\n🔗 ${url}`);
    }

    if (name === "campeonato" && championshipId) {
      const championship = await fetchFaceitChampionship(championshipId);
      const value = championship as Record<string, unknown>;
      const nameValue = typeof value.name === "string" ? value.name : "Campeonato FACEIT";
      const status = typeof value.status === "string" ? value.status : "status indisponível";
      const url = typeof value.faceit_url === "string" ? value.faceit_url : "https://www.faceit.com/";
      return jsonResponse(`🏆 **${nameValue}**\nStatus: **${status}**\n🔗 ${url}`);
    }

    return jsonResponse("Comando inválido ou parâmetro ausente.", true);
  } catch (error) {
    console.error("RJVALS Discord interaction failed", error);
    return jsonResponse("Não consegui consultar a FACEIT agora. Tente novamente em alguns segundos.", true);
  }
}
