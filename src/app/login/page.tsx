import { AuthForm } from "@/components/auth-form";
import { signInAction } from "@/app/actions";

export default function LoginPage() {
  return <main className="min-h-screen bg-[#050505] px-6 py-16 text-white"><AuthForm mode="login" action={signInAction} /></main>;
}
