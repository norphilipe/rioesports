import {
  linkOptionalIdentityAction,
  signOutAction,
  updateProfileAction,
} from "@/app/actions";
import { requireUser } from "@/lib/auth/session";
import {
  CONFIDENCE_COPY,
  type CompetitiveIdentity,
  type PlayerCompetitiveState,
  type RsiConfidenceLevel,
} from "@/lib/competitive/identity";
import { createClient } from "@/lib/supabase/server";

const providers = [
  { key: "steam", label: "Steam", required: true, placeholder: "" },
  { key: "faceit", label: "FACEIT", required: false, placeholder: "Seu nickname ou URL do perfil FACEIT" },
  { key: "leetify", label: "Leetify", required: false, placeholder: "Seu nickname ou URL do perfil Leetify" },
] as const;

const brazilianStates = [
  ["", "Selecione a UF"], ["AC", "AC"], ["AL", "AL"], ["AP", "AP"], ["AM", "AM"],
  ["BA", "BA"], ["CE", "CE"], ["DF", "DF"], ["ES", "ES"], ["GO", "GO"], ["MA", "MA"],
  ["MT", "MT"], ["MS", "MS"], ["MG", "MG"], ["PA", "PA"], ["PB", "PB"], ["PR", "PR"],
  ["PE", "PE"], ["PI", "PI"], ["RJ", "RJ"], ["RN", "RN"], ["RS", "RS"], ["RO", "RO"],
  ["RR", "RR"], ["SC", "SC"], ["SP", "SP"], ["SE", "SE"], ["TO", "TO"],
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
  const displayName = profile?.display_name || profile?.username || user.email || "Jogador";
  const username = profile?.username || "player";

  return (
    <main className="min-h-screen bg-[#050505] px-6 py-16 text-white">
      <section className="mx-auto max-w-3xl space-y-6">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-400">Minha conta</p>
              <h1 className="mt-3 text-3xl font-black">{displayName}</h1>
              <p className="mt-2 text-white/50">@{username}</p>
            </div>
            <span className="rounded-lg border border-cyan-400/20 bg-cyan-400/5 px-3 py-2 text-xs font-bold uppercase tracking-wide text-cyan-300">
              Perfil editável
            </span>
          </div>

          <div className="mt-8 grid gap-4 text-sm text-white/65 sm:grid-cols-2">
            <div><span className="block text-white/35">E-mail</span>{user.email}</div>
            <div><span className="block text-white/35">Localização</span>{profile?.city ? `${profile.city}${profile.state_code ? `, ${profile.state_code}` : ""}` : "Ainda não informada"}</div>
          </div>

          <form action={updateProfileAction} className="mt-8 grid gap-4 border-t border-white/10 pt-7 sm:grid-cols-2">
            <div>
              <label htmlFor="display_name" className="mb-2 block text-xs font-bold uppercase tracking-wide text-white/45">Nome de exibição</label>
              <input id="display_name" name="display_name" required maxLength={80} defaultValue={profile?.display_name ?? ""} className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none transition focus:border-cyan-400/50" />
            </div>
            <div>
              <label htmlFor="username" className="mb-2 block text-xs font-bold uppercase tracking-wide text-white/45">Usuário (@)</label>
              <input id="username" name="username" required minLength={3} maxLength={24} pattern="[a-zA-Z0-9_]+" defaultValue={profile?.username ?? ""} className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none transition focus:border-cyan-400/50" />
            </div>
            <div>
              <label htmlFor="city" className="mb-2 block text-xs font-bold uppercase tracking-wide text-white/45">Cidade</label>
              <input id="city" name="city" maxLength={80} placeholder="Ex.: Rio de Janeiro" defaultValue={profile?.city ?? ""} className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none transition focus:border-cyan-400/50" />
            </div>
            <div>
              <label htmlFor="state_code" className="mb-2 block text-xs font-bold uppercase tracking-wide text-white/45">Estado (UF)</label>
              <select id="state_code" name="state_code" defaultValue={profile?.state_code ?? ""} className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none transition focus:border-cyan-400/50">
                {brazilianStates.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <button className="rounded-lg bg-cyan-400 px-5 py-3 text-sm font-black uppercase tracking-wide text-black transition hover:bg-cyan-300">Salvar alterações</button>
            </div>
          </form>
        </div>

        <section className="rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.03] p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-400">Competitive Identity</p>
              <h2 className="mt-3 text-2xl font-black">Sua identidade competitiva</h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-white/55">
                Steam é a identidade obrigatória. FACEIT e Leetify podem ser vinculadas ao seu perfil para futuras verificações e sincronizações competitivas.
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
              const pending = identity?.status === "pending";

              return (
                <div key={provider.key} className="rounded-xl border border-white/10 bg-black/20 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <strong>{provider.label}</strong>
                    <span className={`text-xs font-bold uppercase tracking-wider ${verified ? "text-emerald-300" : pending ? "text-amber-300" : "text-white/35"}`}>
                      {verified ? "Verificada" : pending ? "Pendente" : "Não vinculada"}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-white/45">
                    {identity?.external_username
                      ? identity.external_username
                      : provider.required
                        ? "Vinculação obrigatória para participar do ambiente competitivo."
                        : "Vincule seu usuário ou URL de perfil para preparar a integração competitiva."}
                  </p>

                  {provider.key === "steam" && !verified ? (
                    <a href="/api/competitive/steam/start" className="mt-5 inline-flex rounded-lg bg-cyan-400 px-4 py-2 text-xs font-black uppercase tracking-wide text-black transition hover:bg-cyan-300">Vincular Steam</a>
                  ) : null}
                  {provider.key === "steam" && verified ? <p className="mt-5 text-xs text-emerald-300/80">Identidade competitiva permanente.</p> : null}

                  {provider.key !== "steam" && !verified ? (
                    <form action={linkOptionalIdentityAction} className="mt-5 space-y-2">
                      <input type="hidden" name="provider" value={provider.key} />
                      <label className="sr-only" htmlFor={`${provider.key}-identity`}>{provider.label}</label>
                      <input id={`${provider.key}-identity`} name="external_username" required maxLength={255} defaultValue={identity?.external_username ?? ""} placeholder={provider.placeholder} className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-xs outline-none transition placeholder:text-white/25 focus:border-cyan-400/50" />
                      <button className="inline-flex rounded-lg border border-cyan-400/30 px-4 py-2 text-xs font-black uppercase tracking-wide text-cyan-300 transition hover:bg-cyan-400/10">{pending ? "Atualizar vínculo" : `Vincular ${provider.label}`}</button>
                    </form>
                  ) : null}

                  {provider.key !== "steam" && pending ? <p className="mt-3 text-xs leading-5 text-amber-200/70">Conta informada. A confirmação automática depende da disponibilidade da integração oficial do provider.</p> : null}
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
