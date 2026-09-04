import Link from "next/link";

const navigation = [
  ["Visão geral", "/admin"],
  ["Conteúdo", "/admin/conteudo"],
  ["Campeonatos", "/admin/campeonatos"],
  ["Matchmaking", "/admin/matchmaking"],
  ["Rankings", "/admin/rankings"],
  ["Usuários", "/admin/usuarios"],
  ["Configurações", "/admin/configuracoes"],
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#070707] text-white">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-[#090909]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <Link href="/admin" className="font-black tracking-tight">RIO ESPORTS <span className="text-cyan-400">ADMIN</span></Link>
          <Link href="/" className="text-sm font-semibold text-white/50 hover:text-white">Ver site ↗</Link>
        </div>
      </header>
      <div className="mx-auto grid max-w-7xl lg:grid-cols-[220px_1fr]">
        <aside className="border-b border-white/10 p-4 lg:min-h-[calc(100vh-65px)] lg:border-b-0 lg:border-r">
          <nav className="flex gap-2 overflow-x-auto lg:flex-col">
            {navigation.map(([label, href]) => <Link key={href} href={href} className="whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold text-white/50 transition hover:bg-white/5 hover:text-cyan-300">{label}</Link>)}
          </nav>
        </aside>
        <div>{children}</div>
      </div>
    </div>
  );
}
