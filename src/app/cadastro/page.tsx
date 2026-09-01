import { AuthForm } from "@/components/auth-form";
import { signUpAction } from "@/app/actions";

export default function CadastroPage() {
  return <main className="min-h-screen bg-[#050505] px-6 py-16 text-white"><AuthForm mode="signup" action={signUpAction} /></main>;
}
