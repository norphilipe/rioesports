import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

const games = [
  { name: "Counter-Strike 2", shortName: "CS2", status: "DISPONÍVEL", description: "Matchmaking competitivo, ranking e campeonatos.", active: true },
  { name: "EA Sports FC", shortName: "FC", status: "EM BREVE", description: "Competições individuais e rankings.", active: false },
  { name: "Street Fighter 6", shortName: "SF6", status: "EM BREVE", description: "Rankings e torneios de fighting games.", active: false },
];

export default async function Home() {
  const user = await getCurrentUser();
  let profile: { username: string | null; display_name: string | null } | null = null;

  if (user) {
    try {
      const supabase = await createClient();
      const { data } = await supabase
        .from("profiles")
        .select("username, display_name")
        .eq("id", user.id)
        .maybeSingle();
      profile = data;
    } catch (error) {
      console.error("Unable to resolve the current user profile:", error);
    }
  }

  const displayName = profile?.display_name?.trim() || profile?.username?.trim() || user?.email?.split("@")[0] || "Jogador";
  const username = profile?.username?.trim() || null;
  const initial = displayName.charAt(0).toUpperCase();

  return <main className="min-h-screen bg-[#050505] text-white">
    <header className="border-b border-white/10"><div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-5 lg:px-8">
      <Link href="/" className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white font-black text-black">R</div><div><div className="text-lg font-black tracking-tight">RIO<span className="text-cyan-400">ESPORTS</span></div><div className="text-[9px] uppercase tracking-[0.25em] text-white/40">Competitive Community</div></div></Link>
      <nav className="hidden items-center gap-8 text-sm font-medium text-white/60 md:flex"><Link className="text-white" href="/">INÍCIO</Link><Link className="transition hover:text-white" href="/noticias">NOTÍCIAS</Link><Link className="transition hover:text-white" href="/matchmaking">MATCHMAKING</Link><a className="transition hover:text-white" href="#campeonatos">CAMPEONATOS</a><a className="transition hover:text-white" href="#ranking">RANKING</a></nav>
      {user ? <Link href="/perfil" aria-label="Abrir meu perfil" className="group flex items-center gap-3 rounded-xl border border-cyan-400/20 bg-cyan-400/[0.05] px-3 py-2 transition hover:border-cyan-400/50 hover:bg-cyan-400/[0.09]"><span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-cyan-400 font-black text-black">{initial}<span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#050505] bg-emerald-400" /></span><span className="hidden min-w-0 text-left sm:block"><span className="block max-w-36 truncate text-xs font-black text-white">{displayName}</span><span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-cyan-300"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Online</span></span><span className="hidden text-[10px] text-white/35 lg:block">{username ? `@${username}` : "Meu perfil"}</span></Link> : <Link href="/login" className="rounded-lg border border-white/15 px-4 py-2 text-sm font-semibold transition hover:border-cyan-400/50 hover:bg-white/5">Entrar</Link>}
    </div></header>
    {user ? <div className="border-b border-cyan-400/10 bg-cyan-400/[0.035]"><div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-3 text-sm sm:flex-row sm:items-center sm:justify-between lg:px-8"><div className="flex items-center gap-3 text-white/65"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-cyan-400/10 text-cyan-300">✓</span><span>Você está conectado como <strong className="text-white">{displayName}</strong>.</span></div><Link href="/perfil" className="text-xs font-black uppercase tracking-wider text-cyan-300 transition hover:text-cyan-200">Ver meu perfil →</Link></div></div> : null}
    <section className="relative overflow-hidden"><div className="absolute left-1/2 top-0 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-cyan-400/10 blur-[140px]" /><div className="relative mx-auto max-w-7xl px-6 pb-24 pt-28 lg:px-8 lg:pt-36"><div className="max-w-4xl"><div className="mb-6 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.3em] text-cyan-400"><span className="h-px w-8 bg-cyan-400" />Rio de Janeiro</div><h1 className="text-5xl font-black leading-[0.95] tracking-[-0.04em] sm:text-7xl lg:text-8xl">A COMPETIÇÃO<br /><span className="text-white/30">COMEÇA AQUI.</span></h1><p className="mt-8 max-w-2xl text-lg leading-8 text-white/55 sm:text-xl">UMA PLATAFORMA COMPETITIVA PARA JOGADORES DO RIO</p><div className="mt-10 flex flex-col gap-3 sm:flex-row">{user ? <Link href="/matchmaking" className="rounded-lg bg-white px-7 py-4 text-center text-sm font-black text-black transition hover:bg-cyan-400">IR PARA O MATCHMAKING</Link> : <Link href="/login" className="rounded-lg bg-white px-7 py-4 text-center text-sm font-black text-black transition hover:bg-cyan-400">COMEÇAR AGORA</Link>}<Link href="/noticias" className="rounded-lg border border-white/15 px-7 py-4 text-center text-sm font-bold transition hover:border-cyan-400/50 hover:bg-white/5">VER NOTÍCIAS</Link></div></div></div></section>
    <section className="border-y border-white/10 bg-white/[0.02]"><div className="mx-auto max-w-7xl px-6 py-14 lg:px-8"><div className="mb-8"><p className="text-xs font-bold uppercase tracking-[0.25em] text-white/30">Jogos</p><h2 className="mt-2 text-2xl font-black">Escolha onde competir.</h2></div><div className="grid gap-4 md:grid-cols-3">{games.map((game) => <div key={game.shortName} className={`rounded-xl border p-6 transition ${game.active ? "border-cyan-400/30 bg-cyan-400/[0.04] hover:border-cyan-400/60" : "border-white/10 bg-white/[0.02] opacity-60"}`}><div className="flex items-start justify-between"><div className="text-3xl font-black">{game.shortName}</div><span className={`rounded-full px-3 py-1 text-[9px] font-black tracking-wider ${game.active ? "bg-cyan-400/10 text-cyan-400" : "bg-white/10 text-white/40"}`}>{game.status}</span></div><h3 className="mt-8 font-bold">{game.name}</h3><p className="mt-2 text-sm leading-6 text-white/40">{game.description}</p></div>)}</div></div></section>
    <section className="mx-auto max-w-7xl px-6 py-24 lg:px-8"><div className="grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 md:grid-cols-3"><Feature number="01" title="MATCHMAKING" description="Encontre jogadores do seu nível através de um sistema competitivo baseado em MMR." href="/matchmaking" /><Feature number="02" title="NOTÍCIAS" description="Acompanhe esports, jogos e as principais novidades da comunidade competitiva." href="/noticias" /><Feature number="03" title="RANKING" description="Construa sua reputação competitiva e descubra quem são os melhores jogadores." /></div></section>
    <section className="border-t border-white/10"><div className="mx-auto max-w-7xl px-6 py-24 text-center lg:px-8"><p className="text-xs font-bold uppercase tracking-[0.3em] text-cyan-400">RIO ESPORTS</p><h2 className="mx-auto mt-5 max-w-3xl text-4xl font-black tracking-tight sm:text-6xl">Seu jogo.<br />Seu ranking.<br />Sua comunidade.</h2><Link href={user ? "/matchmaking" : "/login"} className="mt-10 inline-block rounded-lg bg-white px-8 py-4 text-sm font-black text-black transition hover:bg-cyan-400">{user ? "CONTINUAR COMPETINDO" : "COMEÇAR AGORA"}</Link></div></section><footer className="border-t border-white/10"><div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 px-6 py-8 text-xs text-white/30 sm:flex-row lg:px-8"><span>© 2026 RIO ESPORTS</span><span>Rio de Janeiro, Brasil</span></div></footer>
  </main>;
}
function Feature({ number, title, description, href }: { number: string; title: string; description: string; href?: string }) { const content = <><div className="text-xs font-bold text-cyan-400">{number}</div><h3 className="mt-12 text-lg font-black tracking-wide">{title}</h3><p className="mt-4 text-sm leading-7 text-white/40">{description}</p></>; const className = "block bg-[#080808] p-8 transition hover:bg-[#0d0d0d] lg:p-10"; return href ? <Link href={href} className={className}>{content}</Link> : <div className={className}>{content}</div>; }
