import { AuthForm } from "@/components/auth-form";
import { updatePasswordAction } from "@/app/actions";

export default function RedefinirSenhaPage() {
  return <main className="min-h-screen bg-[#050505] px-6 py-16 text-white"><AuthForm mode="reset" action={updatePasswordAction} /></main>;
}
