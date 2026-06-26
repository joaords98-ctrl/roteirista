"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase-client";

export default function MissaoPage() {
  const router = useRouter();
  const params = useParams();
  const supabase = createClient();
  const [missao, setMissao] = useState<any>(null);
  const [roteiros, setRoteiros] = useState<any[]>([]);
  const [tema, setTema] = useState("");
  const [material, setMaterial] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [resultado, setResultado] = useState<any>(null);

  useEffect(() => { carregar(); }, []);

  async function carregar() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }
    const { data: m } = await supabase.from("missoes").select("*").eq("id", params.id).single();
    if (!m) { router.push("/dashboard"); return; }
    setMissao(m);
    const { data: rs } = await supabase.from("roteiros")
      .select("id, tema, passou, criado_em, publicado")
      .eq("missao_id", params.id).order("criado_em", { ascending: false });
    setRoteiros(rs || []);
  }

  async function gerar() {
    setLoading(true); setErro(""); setResultado(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tema, material, missao_id: params.id }),
      });
      const data = await res.json();
      if (!res.ok) setErro(data.error || "Erro ao gerar");
      else { setResultado(data); setTema(""); setMaterial(""); carregar(); }
    } catch (e: any) { setErro(e.message); }
    setLoading(false);
  }

  if (!missao) return <div className="min-h-screen flex items-center justify-center text-gray-500">Carregando...</div>;

  return (
    <div className="min-h-screen max-w-5xl mx-auto p-4 md:p-8">
      <button onClick={() => router.push("/dashboard")} className="text-sm text-gray-400 mb-4">← Missões</button>

      {/* Cabeçalho da missão */}
      <div className="bg-[#13131a] border border-[#26262f] rounded-2xl p-6 mb-6">
        <div className="flex justify-between items-start mb-2">
          <h1 className="text-2xl font-bold">{missao.titulo}</h1>
          <span className="text-xs px-2 py-1 rounded bg-[#0a0a0f] border border-[#26262f]">{missao.status}</span>
        </div>
        {missao.objetivo && <p className="text-gray-300 mb-3">{missao.objetivo}</p>}
        <div className="flex gap-2 text-xs text-gray-500">
          {missao.plataforma && <span className="px-2 py-0.5 bg-[#0a0a0f] rounded">{missao.plataforma}</span>}
          {missao.publico && <span className="px-2 py-0.5 bg-[#0a0a0f] rounded">{missao.publico}</span>}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Gerador no contexto da missão */}
        <div className="bg-[#13131a] border border-[#26262f] rounded-2xl p-6">
          <h2 className="font-semibold mb-1">Novo roteiro</h2>
          <p className="text-xs text-gray-500 mb-4">A IA já considera o objetivo desta missão e seu perfil.</p>
          <textarea
            className="w-full mb-3 px-4 py-3 bg-[#0a0a0f] border border-[#26262f] rounded-lg outline-none focus:border-red-500 min-h-[80px]"
            placeholder="Tema / o que você apurou"
            value={tema} onChange={(e) => setTema(e.target.value)} />
          <textarea
            className="w-full mb-4 px-4 py-3 bg-[#0a0a0f] border border-[#26262f] rounded-lg outline-none focus:border-red-500 min-h-[100px]"
            placeholder="Material bruto: números, fontes, datas (opcional)"
            value={material} onChange={(e) => setMaterial(e.target.value)} />
          <button onClick={gerar} disabled={loading || tema.length < 3}
            className="w-full py-3 bg-red-600 hover:bg-red-700 rounded-lg font-semibold disabled:opacity-50">
            {loading ? "Gerando..." : "Gerar roteiro"}
          </button>
          {erro && <p className="text-red-400 text-sm mt-3">{erro}</p>}
        </div>

        {/* Roteiros desta missão */}
        <div className="bg-[#13131a] border border-[#26262f] rounded-2xl p-6">
          <h2 className="font-semibold mb-4">Roteiros desta missão</h2>
          {roteiros.length === 0 && <p className="text-gray-500 text-sm">Nenhum roteiro ainda.</p>}
          <div className="space-y-2">
            {roteiros.map((r) => (
              <button key={r.id} onClick={() => router.push(`/script/${r.id}`)}
                className="w-full text-left px-3 py-2 bg-[#0a0a0f] border border-[#26262f] rounded-lg hover:border-red-500 flex justify-between items-center">
                <span className="text-sm truncate">{r.tema}</span>
                <div className="flex gap-1 shrink-0">
                  {r.publicado && <span className="text-xs px-2 py-0.5 rounded bg-blue-900 text-blue-300">pub</span>}
                  <span className={`text-xs px-2 py-0.5 rounded ${r.passou ? "bg-green-900 text-green-300" : "bg-yellow-900 text-yellow-300"}`}>
                    {r.passou ? "✓" : "!"}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {resultado && <RoteiroView resultado={resultado} />}
    </div>
  );
}

function RoteiroView({ resultado }: { resultado: any }) {
  const { roteiro, check } = resultado;
  return (
    <div className="mt-6 bg-[#13131a] border border-[#26262f] rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <h2 className="font-semibold">Roteiro gerado</h2>
        <span className={`text-xs px-2 py-1 rounded ${check.passou ? "bg-green-900 text-green-300" : "bg-yellow-900 text-yellow-300"}`}>
          {check.passou ? "Passou na verificação" : "Revisar alertas"}
        </span>
      </div>
      <div className="mb-4 p-4 bg-[#0a0a0f] rounded-lg border border-[#26262f]">
        <div className="text-xs text-red-500 mb-1">HEADLINE</div>
        <div className="font-bold">{roteiro.headline}</div>
      </div>
      <div className="mb-4 p-4 bg-[#0a0a0f] rounded-lg border border-[#26262f]">
        <div className="text-xs text-red-500 mb-1">HOOK</div>
        <div>{roteiro.hook}</div>
      </div>
      {roteiro.blocos?.map((b: any) => (
        <div key={b.numero} className="mb-3 p-4 bg-[#0a0a0f] rounded-lg border border-[#26262f]">
          <div className="text-xs text-gray-500 mb-1">BLOCO {b.numero} — {b.titulo}</div>
          <div className="text-sm leading-relaxed">{b.texto}</div>
        </div>
      ))}
      <div className="mb-4 p-4 bg-[#0a0a0f] rounded-lg border border-red-900">
        <div className="text-xs text-red-500 mb-1">CTA</div>
        <div>{roteiro.cta}</div>
      </div>
      <details className="mt-4">
        <summary className="cursor-pointer text-sm text-gray-400">Verificação ({check.totalPalavras} palavras)</summary>
        <div className="mt-3 space-y-1">
          {check.alertas.map((a: any, i: number) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              <span>{a.status === "ok" ? "✅" : a.status === "falha" ? "❌" : "⚠️"}</span>
              <span className="text-gray-300">{a.regra}:</span>
              <span className="text-gray-500">{a.detalhe}</span>
            </div>
          ))}
        </div>
      </details>
    </div>
  );
}
