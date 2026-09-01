import Link from "next/link";

export default async function ConfirmacaoPage({ searchParams }: { searchParams: Promise<{ email?: string }> }) {
  const { email } = await searchParams;
  return (
    <main className="min-h-screen bg-[#050505] px-6 py-16 text-white">
      <section className="mx-auto max-w-md rounded-2xl border border-white/10 bg-white/[0.03] p-8">
        <h1 className="text-2xl font-black">Confirme seu e-mail</h1>
        <p className="mt-3 text-sm leading-6 text-white/60">Enviamos um link de confirmação{email ? ` para ${email}` : ""}. Abra o e-mail e conclua a ativação da sua conta.</p>
        <Link href="/login" className="mt-7 inline-block rounded-lg bg-white px-5 py-3 text-sm font-black text-black hover:bg-cyan-400">IR PARA O LOGIN</Link>
      </section>
    </main>
  );
}
