"use client";
export const dynamic = "force-dynamic";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [modo, setModo] = useState<"login" | "cadastro">("login");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handle() {
    setLoading(true);
    setMsg("");
    if (modo === "cadastro") {
      const { error } = await supabase.auth.signUp({ email, password: senha });
      if (error) setMsg(error.message);
      else { router.push("/onboarding"); router.refresh(); }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
      if (error) setMsg(error.message);
      else { router.push("/dashboard"); router.refresh(); }
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-[#13131a] border border-[#26262f] rounded-2xl p-8">
        <div className="text-xs tracking-widest text-red-500 mb-1">CLASSIFICADO • ACESSO</div>
        <h1 className="text-2xl font-bold mb-6">RoterizAI</h1>

        <input
          className="w-full mb-3 px-4 py-3 bg-[#0a0a0f] border border-[#26262f] rounded-lg outline-none focus:border-red-500"
          placeholder="E-mail" type="email" value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="w-full mb-4 px-4 py-3 bg-[#0a0a0f] border border-[#26262f] rounded-lg outline-none focus:border-red-500"
          placeholder="Senha (mín. 6 caracteres)" type="password" value={senha}
          onChange={(e) => setSenha(e.target.value)}
        />

        <button
          onClick={handle} disabled={loading}
          className="w-full py-3 bg-red-600 hover:bg-red-700 rounded-lg font-semibold disabled:opacity-50"
        >
          {loading ? "..." : modo === "login" ? "Entrar" : "Criar conta"}
        </button>

        {msg && <p className="text-red-400 text-sm mt-3">{msg}</p>}

        <button
          onClick={() => setModo(modo === "login" ? "cadastro" : "login")}
          className="w-full text-sm text-gray-400 mt-4 hover:text-white"
        >
          {modo === "login" ? "Não tem conta? Cadastre-se" : "Já tem conta? Entrar"}
        </button>
      </div>
    </div>
  );
}
