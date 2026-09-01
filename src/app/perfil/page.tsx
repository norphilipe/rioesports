import { signOutAction } from "@/app/actions";
import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export default async function PerfilPage() {
  const user = await requireUser();
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("username, display_name, avatar_url, bio, city, state_code")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <main className="min-h-screen bg-[#050505] px-6 py-16 text-white">
      <section className="mx-auto max-w-2xl rounded-2xl border border-white/10 bg-white/[0.03] p-8">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-400">Minha conta</p>
        <h1 className="mt-3 text-3xl font-black">{profile?.display_name ?? user.email}</h1>
        <p className="mt-2 text-white/50">@{profile?.username ?? "player"}</p>
        <div className="mt-8 grid gap-4 text-sm text-white/65 sm:grid-cols-2">
          <div><span className="block text-white/35">E-mail</span>{user.email}</div>
          <div><span className="block text-white/35">Localização</span>{profile?.city ? `${profile.city}${profile.state_code ? `, ${profile.state_code}` : ""}` : "Ainda não informada"}</div>
        </div>
        <form action={signOutAction} className="mt-10"><button className="rounded-lg border border-white/15 px-5 py-3 text-sm font-bold hover:bg-white/5">SAIR</button></form>
      </section>
    </main>
  );
}
