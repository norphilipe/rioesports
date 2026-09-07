import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type Profile = {
  id: string;
  display_name: string | null;
  username: string | null;
  created_at: string;
};

type ModerationAction = {
  id: string;
  target_profile_id: string;
  action_type: string;
  reason: string | null;
  expires_at: string | null;
  created_at: string;
};

export default async function AdminModerationPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: isAdmin } = await supabase.rpc("is_current_platform_admin");
  if (!isAdmin) redirect("/");

  const [{ data: users }, { data: admins }, { data: actions }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id,display_name,username,created_at")
      .order("created_at", { ascending: false })
      .limit(100),
    supabase.from("platform_admins").select("profile_id,role"),
    supabase
      .from("platform_moderation_actions")
      .select("id,target_profile_id,action_type,reason,expires_at,created_at")
      .order("created_at", { ascending: false })
      .limit(100),
  ]);

  const profiles = (users ?? []) as Profile[];
  const moderationActions = (actions ?? []) as ModerationAction[];
  const now = new Date();
  const activeActions = moderationActions.filter(
    (action) => !action.expires_at || new Date(action.expires_at) > now,
  ).length;

  const profileName = (profileId: string) => {
    const profile = profiles.find((item) => item.id === profileId);
    return profile?.display_name ?? profile?.username ?? "Usuário";
  };

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-8 text-zinc-100 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <Link href="/admin" className="text-sm text-cyan-400">
          ← Administração
        </Link>

        <h1 className="mt-3 text-3xl font-black">Usuários e moderação</h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-400">
          Histórico disciplinar da RIO ESPORTS. Esta área usa o schema
          administrativo oficial da plataforma.
        </p>

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <Stat label="Usuários" value={profiles.length} />
          <Stat label="Administradores" value={admins?.length ?? 0} />
          <Stat label="Ações ativas" value={activeActions} />
        </section>

        <section className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900/60">
          <h2 className="border-b border-zinc-800 p-6 font-bold">
            Histórico disciplinar
          </h2>

          <div className="divide-y divide-zinc-800">
            {moderationActions.map((action) => (
              <div key={action.id} className="p-5">
                <div className="flex flex-col justify-between gap-4 sm:flex-row">
                  <div>
                    <p className="font-bold">
                      {profileName(action.target_profile_id)}
                    </p>
                    {action.reason && (
                      <p className="mt-2 text-sm text-zinc-400">
                        {action.reason}
                      </p>
                    )}
                    <p className="mt-2 text-xs text-zinc-500">
                      Registrada em{" "}
                      {new Intl.DateTimeFormat("pt-BR", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      }).format(new Date(action.created_at))}
                    </p>
                  </div>

                  <div className="flex h-fit flex-wrap gap-2">
                    <span className="rounded-full bg-red-500/10 px-2 py-1 text-xs text-red-300">
                      {action.action_type}
                    </span>
                    {action.expires_at && (
                      <span className="rounded-full bg-zinc-800 px-2 py-1 text-xs text-zinc-300">
                        Expira em{" "}
                        {new Intl.DateTimeFormat("pt-BR", {
                          dateStyle: "medium",
                        }).format(new Date(action.expires_at))}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {!moderationActions.length && (
              <p className="p-8 text-center text-zinc-500">
                Nenhuma ação disciplinar registrada.
              </p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
      <p className="text-sm text-zinc-400">{label}</p>
      <p className="mt-2 text-3xl font-black">{value}</p>
    </div>
  );
}
