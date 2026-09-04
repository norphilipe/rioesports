import Link from "next/link";

export default function AccessDeniedPage() {
  return <main className="flex min-h-[70vh] items-center justify-center p-6"><div className="max-w-md text-center"><p className="text-sm font-black uppercase tracking-[0.25em] text-red-400">Acesso restrito</p><h1 className="mt-4 text-4xl font-black">Você não possui permissão para acessar esta área.</h1><p className="mt-4 text-white/50">O sistema de autenticação e cargos será conectado ao Supabase antes de qualquer operação administrativa crítica.</p><Link href="/" className="mt-8 inline-block rounded-lg bg-cyan-400 px-5 py-3 font-black text-black">Voltar ao site</Link></div></main>;
}
