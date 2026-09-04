import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ eligible: false, reason: "Faça login para participar do matchmaking." }, { status: 401 });
  const { data: restricted, error } = await supabase.rpc("is_user_competitively_restricted", { target_user_id: user.id });
  if (error) return NextResponse.json({ eligible: false, reason: "Não foi possível verificar sua elegibilidade." }, { status: 500 });
  return NextResponse.json({ eligible: !restricted, reason: restricted ? "Sua conta possui uma restrição competitiva ativa." : null });
}
