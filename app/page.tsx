import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: perfil } = await supabase.from("perfis").select("user_id").eq("user_id", user.id).single();
  if (!perfil) redirect("/onboarding");
  redirect("/dashboard");
}
