"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type QueuePanelProps = { queueModeId?: string; playerGameProfileId?: string };
export function QueuePanel({ queueModeId, playerGameProfileId }: QueuePanelProps) {
  const [status, setStatus] = useState<"idle"|"loading"|"queued"|"error">("idle");
  const [message, setMessage] = useState("Conecte seu perfil competitivo para entrar na fila.");
  async function joinQueue() {
    setStatus("loading"); setMessage("Verificando elegibilidade competitiva...");
    const eligibility = await fetch("/api/matchmaking/eligibility", { cache: "no-store" });
    const eligibilityData = await eligibility.json().catch(() => null);
    if (!eligibility.ok || !eligibilityData?.eligible) { setStatus("error"); setMessage(eligibilityData?.reason ?? "Você não pode entrar na fila neste momento."); return; }
    if (!queueModeId || !playerGameProfileId) { setStatus("error"); setMessage("A fila ainda precisa ser configurada para seu perfil competitivo."); return; }
    setMessage("Entrando na fila competitiva..."); const supabase=createClient();
    const {error}=await supabase.rpc("join_matchmaking_queue",{p_queue_mode_id:queueModeId,p_player_game_profile_id:playerGameProfileId});
    if(error){setStatus("error");setMessage(error.message);return;} setStatus("queued");setMessage("Você entrou na fila. Procurando jogadores compatíveis...");
  }
  return <div className="mt-8 rounded-xl border border-white/10 bg-black/20 p-5"><button type="button" onClick={joinQueue} disabled={status==="loading"||status==="queued"} className="w-full rounded-lg bg-white px-4 py-3 text-sm font-black text-black transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60">{status==="loading"?"VERIFICANDO...":status==="queued"?"NA FILA":"ENTRAR NA FILA"}</button><p className={`mt-3 text-center text-xs ${status==="error"?"text-red-300":"text-white/45"}`}>{message}</p></div>;
}
