export default function NewAdminNewsPage() {
  return (
    <main className="p-6 lg:p-10">
      <p className="text-xs font-black uppercase tracking-[0.28em] text-cyan-400">Conteúdo / Notícias</p>
      <h1 className="mt-3 text-4xl font-black">Nova notícia</h1>
      <form className="mt-10 max-w-4xl space-y-6">
        <label className="block"><span className="text-sm font-bold">Título</span><input disabled placeholder="Digite o título da notícia" className="mt-2 w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-white placeholder:text-white/25" /></label>
        <label className="block"><span className="text-sm font-bold">Resumo</span><textarea disabled placeholder="Um resumo curto para apresentação da notícia" rows={3} className="mt-2 w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-white placeholder:text-white/25" /></label>
        <label className="block"><span className="text-sm font-bold">Conteúdo</span><textarea disabled placeholder="O editor completo será conectado ao banco de dados e ao sistema de publicação." rows={12} className="mt-2 w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-white placeholder:text-white/25" /></label>
        <div className="rounded-xl border border-amber-400/20 bg-amber-400/[0.04] p-4 text-sm text-amber-200">A interface está preparada. Os campos serão habilitados após concluirmos autenticação, permissões e persistência segura no Supabase.</div>
      </form>
    </main>
  );
}
