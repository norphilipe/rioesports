import Link from "next/link";

const stats = [
  ["Publicadas", "0"],
  ["Rascunhos", "0"],
  ["Agendadas", "0"],
];

export default function AdminNewsPage() {
  return (
    <main className="p-6 lg:p-10">
      <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
        <div><p className="text-xs font-black uppercase tracking-[0.28em] text-cyan-400">Conteúdo</p><h1 className="mt-3 text-4xl font-black">Notícias</h1><p className="mt-3 text-white/50">Gerencie todas as notícias publicadas no Rio Esports.</p></div>
        <Link href="/admin/noticias/nova" className="rounded-lg bg-cyan-400 px-5 py-3 text-center font-black text-black transition hover:bg-cyan-300">+ Nova notícia</Link>
      </div>
      <div className="mt-10 grid gap-4 sm:grid-cols-3">{stats.map(([label, value]) => <div key={label} className="rounded-xl border border-white/10 bg-white/[0.025] p-5"><p className="text-sm text-white/45">{label}</p><p className="mt-2 text-3xl font-black">{value}</p></div>)}</div>
      <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.02] p-10 text-center"><p className="text-lg font-black">Nenhuma notícia cadastrada</p><p className="mt-2 text-sm text-white/45">A conexão com o banco de dados será adicionada nesta próxima etapa.</p></div>
    </main>
  );
}
