import { AuthForm } from "@/components/auth-form";
import { requestPasswordResetAction } from "@/app/actions";

export default function RecuperarSenhaPage() {
  return <main className="min-h-screen bg-[#050505] px-6 py-16 text-white"><AuthForm mode="recover" action={requestPasswordResetAction} /></main>;
}
