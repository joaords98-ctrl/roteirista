"use client";
export const dynamic = "force-dynamic";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-client";

const NICHOS = ["Política", "Segurança", "Economia", "Denúncias", "Agronegócio", "Saúde", "Religião"];

export default function Onboarding() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [f, setF] = useState({
    nicho: "", tom: "informal", abordagem: "neutro", estilo: "jornalístico",
    formato: "narração", aparece: false, duracao: 60, publico: "neutro",
  });

  function set(k: string, v: any) { setF({ ...f, [k]: v }); }

  async function salvar() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }
    await supabase.from("perfis").upsert({ user_id: user.id, ...f });
    router.push("/dashboard");
    router.refresh();
  }

  const Campo = ({ label, k, opcoes }: { label: string; k: string; opcoes: string[] }) => (
    <div className="mb-5">
      <label className="block text-sm text-gray-400 mb-2">{label}</label>
      <div className="flex flex-wrap gap-2">
        {opcoes.map((o) => (
          <button key={o} onClick={() => set(k, o)}
            className={`px-3 py-1.5 rounded-lg text-sm border ${
              (f as any)[k] === o ? "bg-red-600 border-red-600" : "bg-[#0a0a0f] border-[#26262f]"
            }`}>{o}</button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-[#13131a] border border-[#26262f] rounded-2xl p-8">
        <div className="text-xs tracking-widest text-red-500 mb-1">PERFIL DO CRIADOR</div>
        <h1 className="text-2xl font-bold mb-6">Configure seu DNA editorial</h1>

        <Campo label="Qual seu nicho?" k="nicho" opcoes={NICHOS} />
        <Campo label="Tom" k="tom" opcoes={["formal", "informal"]} />
        <Campo label="Abordagem" k="abordagem" opcoes={["agressivo", "neutro"]} />
        <Campo label="Estilo" k="estilo" opcoes={["jornalístico", "opinativo"]} />
        <Campo label="Formato" k="formato" opcoes={["narração", "falando para câmera"]} />
        <Campo label="Duração alvo" k="duracao" opcoes={["30", "60", "90"]} />
        <Campo label="Contexto de público" k="publico" opcoes={["direita", "esquerda", "neutro"]} />

        <div className="mb-6">
          <label className="flex items-center gap-2 text-sm text-gray-300">
            <input type="checkbox" checked={f.aparece}
              onChange={(e) => set("aparece", e.target.checked)} />
            Você aparece nos vídeos?
          </label>
        </div>

        <button onClick={salvar} disabled={loading || !f.nicho}
          className="w-full py-3 bg-red-600 hover:bg-red-700 rounded-lg font-semibold disabled:opacity-50">
          {loading ? "Salvando..." : "Salvar e começar"}
        </button>
        <p className="text-xs text-gray-500 mt-3">
          O contexto de público serve só para entender a comunicação — nunca altera a análise dos fatos.
        </p>
      </div>
    </div>
  );
}
