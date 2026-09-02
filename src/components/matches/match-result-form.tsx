"use client";

import { useState } from "react";

type MatchResultFormProps = {
  matchId: string;
  teamAId?: string;
  teamBId?: string;
};

export function MatchResultForm({ matchId, teamAId = "team-a", teamBId = "team-b" }: MatchResultFormProps) {
  const [winner, setWinner] = useState<"A" | "B">("A");
  const [scoreA, setScoreA] = useState(13);
  const [scoreB, setScoreB] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (scoreA === scoreB) return;
    setLoading(true);
    setMessage(null);
    try {
      const winnerTeamId = winner === "A" ? teamAId : teamBId;
      const loserTeamId = winner === "A" ? teamBId : teamAId;
      const winnerScore = winner === "A" ? scoreA : scoreB;
      const loserScore = winner === "A" ? scoreB : scoreA;
      const response = await fetch(`/api/competitive/matches/${matchId}/result`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ winnerTeamId, loserTeamId, winnerScore, loserScore }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not submit match result");
      setSubmitted(true);
      setMessage(data.status === "confirmed" ? "Resultado confirmado. O processamento competitivo será iniciado." : data.status === "conflict" ? "Há conflito entre os resultados enviados. A partida será revisada." : "Resultado enviado. Aguardando confirmação do adversário.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Não foi possível enviar o resultado.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
      <p className="text-xs font-bold tracking-[0.2em] text-cyan-400">RESULTADO</p>
      <h3 className="mt-2 text-xl font-black">Registrar resultado</h3>
      <p className="mt-2 text-sm text-white/45">Partida #{matchId.slice(0, 8)}. O resultado será confirmado antes de alterar o ranking.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-semibold text-white/70">Placar Time A<input value={scoreA} onChange={(event) => setScoreA(Number(event.target.value))} type="number" min="0" className="mt-2 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-3 text-white outline-none" /></label>
        <label className="text-sm font-semibold text-white/70">Placar Time B<input value={scoreB} onChange={(event) => setScoreB(Number(event.target.value))} type="number" min="0" className="mt-2 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-3 text-white outline-none" /></label>
      </div>
      <div className="mt-5 flex gap-3"><button onClick={() => setWinner("A")} className={`rounded-lg px-4 py-2 text-sm font-bold ${winner === "A" ? "bg-cyan-400 text-black" : "border border-white/10 text-white/60"}`}>TIME A VENCEU</button><button onClick={() => setWinner("B")} className={`rounded-lg px-4 py-2 text-sm font-bold ${winner === "B" ? "bg-cyan-400 text-black" : "border border-white/10 text-white/60"}`}>TIME B VENCEU</button></div>
      <button onClick={submit} disabled={loading || submitted || scoreA === scoreB} className="mt-6 w-full rounded-lg bg-cyan-400 px-4 py-3 text-sm font-black text-black disabled:opacity-50">{loading ? "ENVIANDO..." : submitted ? "RESULTADO ENVIADO" : "ENVIAR RESULTADO"}</button>
      {message && <p className="mt-4 text-sm text-white/55">{message}</p>}
    </section>
  );
}
