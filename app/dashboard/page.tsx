"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-client";

export default function Dashboard() {
  const router = useRouter();
  const supabase = createClient();
  const [missoes, setMissoes] = useState<any[]>([]);
  const [criando, setCriando] = useState(false);
  const [nova, setNova] = useState({ titulo: "", objetivo: "", publico: "", plataforma: "Instagram" });
  const [loading, setLoading] = useState(true);

  useEffect(() => { carregar(); }, []);

  async function carregar() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }
    const { data } = await supabase
      .from("missoes").select("*").order("criado_em", { ascending: false });
    setMissoes(data || []);
    setLoading(false);
  }

  async function criarMissao() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !nova.titulo) return;
    const { data } = await supabase.from("missoes")
      .insert({ user_id: user.id, ...nova }).select().single();
    setCriando(false);
    setNova({ titulo: "", objetivo: "", publico: "", plataforma: "Instagram" });
    if (data) router.push(`/missao/${data.id}`);
  }

  async function sair() {
    await supabase.auth.signOut();
    router.push("/login"); router.refresh();
  }

  return (
    <div className="min-h-screen max-w-5xl mx-auto p-4 md:p-8">
      <header className="flex justify-between items-center mb-8">
        <div>
          <div className="text-xs tracking-widest text-red-500">SISTEMA OPERACIONAL DE CONTEÚDO</div>
          <h1 className="text-xl font-bold">RoterizAI</h1>
        </div>
        <div className="flex gap-2">
          <button onClick={() => router.push("/onboarding")}
            className="text-sm px-3 py-2 border border-[#26262f] rounded-lg">Perfil</button>
          <button onClick={sair}
            className="text-sm px-3 py-2 border border-[#26262f] rounded-lg">Sair</button>
        </div>
      </header>

      <div className="flex justify-between items-center mb-5">
        <div>
          <h2 className="text-lg font-semibold">Missões</h2>
          <p className="text-sm text-gray-500">Cada missão é um objetivo. Os roteiros vivem dentro dela.</p>
        </div>
        <button onClick={() => setCriando(true)}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-semibold text-sm">
          + Nova missão
        </button>
      </div>

      {criando && (
        <div className="bg-[#13131a] border border-red-900 rounded-2xl p-6 mb-6">
          <h3 className="font-semibold mb-4">Criar missão</h3>
          <input className="w-full mb-3 px-4 py-3 bg-[#0a0a0f] border border-[#26262f] rounded-lg outline-none focus:border-red-500"
            placeholder="Título (ex: Crescer no Instagram com investigações)"
            value={nova.titulo} onChange={(e) => setNova({ ...nova, titulo: e.target.value })} />
          <textarea className="w-full mb-3 px-4 py-3 bg-[#0a0a0f] border border-[#26262f] rounded-lg outline-none focus:border-red-500"
            placeholder="Objetivo: o que você quer atingir com esta missão?"
            value={nova.objetivo} onChange={(e) => setNova({ ...nova, objetivo: e.target.value })} />
          <div className="grid grid-cols-2 gap-3 mb-4">
            <input className="px-4 py-3 bg-[#0a0a0f] border border-[#26262f] rounded-lg outline-none focus:border-red-500"
              placeholder="Público-alvo" value={nova.publico}
              onChange={(e) => setNova({ ...nova, publico: e.target.value })} />
            <select className="px-4 py-3 bg-[#0a0a0f] border border-[#26262f] rounded-lg outline-none focus:border-red-500"
              value={nova.plataforma} onChange={(e) => setNova({ ...nova, plataforma: e.target.value })}>
              <option>Instagram</option><option>TikTok</option><option>YouTube</option><option>Kwai</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button onClick={criarMissao} disabled={!nova.titulo}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-semibold disabled:opacity-50">Criar</button>
            <button onClick={() => setCriando(false)}
              className="px-4 py-2 border border-[#26262f] rounded-lg">Cancelar</button>
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-gray-500">Carregando...</p>
      ) : missoes.length === 0 && !criando ? (
        <div className="bg-[#13131a] border border-[#26262f] rounded-2xl p-10 text-center">
          <p className="text-gray-400 mb-4">Nenhuma missão ainda. Comece criando seu primeiro objetivo.</p>
          <button onClick={() => setCriando(true)}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-semibold">Criar primeira missão</button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {missoes.map((m) => (
            <button key={m.id} onClick={() => router.push(`/missao/${m.id}`)}
              className="text-left bg-[#13131a] border border-[#26262f] rounded-2xl p-5 hover:border-red-500 transition">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold">{m.titulo}</h3>
                <span className="text-xs px-2 py-0.5 rounded bg-[#0a0a0f] border border-[#26262f]">{m.status}</span>
              </div>
              {m.objetivo && <p className="text-sm text-gray-400 mb-3 line-clamp-2">{m.objetivo}</p>}
              <div className="flex gap-2 text-xs text-gray-500">
                {m.plataforma && <span className="px-2 py-0.5 bg-[#0a0a0f] rounded">{m.plataforma}</span>}
                {m.publico && <span className="px-2 py-0.5 bg-[#0a0a0f] rounded">{m.publico}</span>}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
