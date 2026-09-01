import { signOutAction } from "@/app/actions";
import { requireUser } from "@/lib/auth/session";
import {
  CONFIDENCE_COPY,
  type CompetitiveIdentity,
  type PlayerCompetitiveState,
  type RsiConfidenceLevel,
} from "@/lib/competitive/identity";
import { createClient } from "@/lib/supabase/server";

const providers = [
  { key: "steam", label: "Steam", required: true },
  { key: "faceit", label: "FACEIT", required: false },
  { key: "leetify", label: "Leetify", required: false },
] as const;

export default async function PerfilPage() {
  const user = await requireUser();
  const supabase = await createClient();

  const [{ data: profile }, { data: identities }, { data: competitiveState }] = await Promise.all([
    supabase
      .from("profiles")
      .select("username, display_name, avatar_url, bio, city, state_code")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("competitive_identities")
      .select("provider, external_id, external_username, status, data_available, verified_at, last_verified_at")
      .eq("user_id", user.id),
    supabase
      .from("player_competitive_state")
      .select("rsi, confidence_score, confidence_level, faceit_ban_detected, competitive_lock_reason, calculated_at")
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);

  const identityList = (identities ?? []) as CompetitiveIdentity[];
  const identityByProvider = new Map(identityList.map((identity) => [identity.provider, identity]));
  const state = competitiveState as PlayerCompetitiveState | null;
  const confidence = CONFIDENCE_COPY[(state?.confidence_level ?? "low") as RsiConfidenceLevel];

  return (
    <main className="min-h-screen bg-[#050505] px-6 py-16 text-white">
      <section className="mx-auto max-w-3xl space-y-6">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-400">Minha conta</p>
          <h1 className="mt-3 text-3xl font-black">{profile?.display_name ?? user.email}</h1>
          <p className="mt-2 text-white/50">@{profile?.username ?? "player"}</p>
          <div className="mt-8 grid gap-4 text-sm text-white/65 sm:grid-cols-2">
            <div><span className="block text-white/35">E-mail</span>{user.email}</div>
            <div><span className="block text-white/35">Localização</span>{profile?.city ? `${profile.city}${profile.state_code ? `, ${profile.state_code}` : ""}` : "Ainda não informada"}</div>
          </div>
        </div>

        <section className="rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.03] p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-400">Competitive Identity</p>
              <h2 className="mt-3 text-2xl font-black">Sua identidade competitiva</h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-white/55">
                Steam é a identidade obrigatória. FACEIT e Leetify fortalecem a confiança dos dados usados pelo RSI.
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/20 px-5 py-4 sm:min-w-40">
              <span className="block text-xs font-bold uppercase tracking-wider text-white/35">RSI Confidence</span>
              <strong className="mt-1 block text-2xl font-black text-cyan-300">{confidence.label}</strong>
              <span className="text-xs text-white/40">{state?.confidence_score ?? 0}/100</span>
            </div>
          </div>

          <p className="mt-6 text-sm text-white/50">{confidence.description}</p>

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {providers.map((provider) => {
              const identity = identityByProvider.get(provider.key);
              const verified = identity?.status === "verified";

              return (
                <div key={provider.key} className="rounded-xl border border-white/10 bg-black/20 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <strong>{provider.label}</strong>
                    <span className={`text-xs font-bold uppercase tracking-wider ${verified ? "text-emerald-300" : "text-white/35"}`}>
                      {verified ? "Verificada" : identity ? "Pendente" : "Não vinculada"}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-white/45">
                    {identity?.external_username
                      ? identity.external_username
                      : provider.required
                        ? "Vinculação obrigatória para participar do ambiente competitivo."
                        : "Provider opcional para ampliar a confiança dos dados competitivos."}
                  </p>
                </div>
              );
            })}
          </div>

          {state?.competitive_lock_reason ? (
            <div className="mt-6 rounded-xl border border-red-400/30 bg-red-400/5 p-4 text-sm text-red-200">
              Conta competitiva bloqueada: {state.competitive_lock_reason}
            </div>
          ) : null}
        </section>

        <form action={signOutAction}><button className="rounded-lg border border-white/15 px-5 py-3 text-sm font-bold hover:bg-white/5">SAIR</button></form>
      </section>
    </main>
  );
}
