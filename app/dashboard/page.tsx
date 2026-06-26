"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-client";

export default function Dashboard() {
  const router = useRouter();
  const supabase = createClient();
  const [tema, setTema] = useState("");
  const [material, setMaterial] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [resultado, setResultado] = useState<any>(null);
  const [historico, setHistorico] = useState<any[]>([]);

  useEffect(() => { carregar(); }, []);

  async function carregar() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }
    const { data } = await supabase
      .from("roteiros").select("id, tema, passou, criado_em")
      .order("criado_em", { ascending: false }).limit(20);
    setHistorico(data || []);
  }

  async function gerar() {
    setLoading(true); setErro(""); setResultado(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tema, material }),
      });
      const data = await res.json();
      if (!res.ok) { setErro(data.error || "Erro ao gerar"); }
      else { setResultado(data); carregar(); }
    } catch (e: any) { setErro(e.message); }
    setLoading(false);
  }

  async function sair() {
    await supabase.auth.signOut();
    router.push("/login"); router.refresh();
  }

  return (
    <div className="min-h-screen max-w-5xl mx-auto p-4 md:p-8">
      <header className="flex justify-between items-center mb-8">
        <div>
          <div className="text-xs tracking-widest text-red-500">MÉTODO DE PRODUÇÃO</div>
          <h1 className="text-xl font-bold">Roteiro Investigativo</h1>
        </div>
        <div className="flex gap-2">
          <button onClick={() => router.push("/onboarding")}
            className="text-sm px-3 py-2 border border-[#26262f] rounded-lg">Perfil</button>
          <button onClick={sair}
            className="text-sm px-3 py-2 border border-[#26262f] rounded-lg">Sair</button>
        </div>
      </header>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Gerador */}
        <div className="bg-[#13131a] border border-[#26262f] rounded-2xl p-6">
          <h2 className="font-semibold mb-4">Nova apuração</h2>
          <textarea
            className="w-full mb-3 px-4 py-3 bg-[#0a0a0f] border border-[#26262f] rounded-lg outline-none focus:border-red-500 min-h-[90px]"
            placeholder="Tema / o que você apurou (ex: vereador usou verba de gabinete para...)"
            value={tema} onChange={(e) => setTema(e.target.value)} />
          <textarea
            className="w-full mb-4 px-4 py-3 bg-[#0a0a0f] border border-[#26262f] rounded-lg outline-none focus:border-red-500 min-h-[120px]"
            placeholder="Material bruto: números, fontes, documentos, datas (opcional, mas recomendado)"
            value={material} onChange={(e) => setMaterial(e.target.value)} />
          <button onClick={gerar} disabled={loading || tema.length < 3}
            className="w-full py-3 bg-red-600 hover:bg-red-700 rounded-lg font-semibold disabled:opacity-50">
            {loading ? "Gerando roteiro..." : "Gerar roteiro"}
          </button>
          {erro && <p className="text-red-400 text-sm mt-3">{erro}</p>}
        </div>

        {/* Biblioteca */}
        <div className="bg-[#13131a] border border-[#26262f] rounded-2xl p-6">
          <h2 className="font-semibold mb-4">Biblioteca</h2>
          {historico.length === 0 && <p className="text-gray-500 text-sm">Nenhum roteiro ainda.</p>}
          <div className="space-y-2">
            {historico.map((h) => (
              <button key={h.id} onClick={() => router.push(`/script/${h.id}`)}
                className="w-full text-left px-3 py-2 bg-[#0a0a0f] border border-[#26262f] rounded-lg hover:border-red-500 flex justify-between items-center">
                <span className="text-sm truncate">{h.tema}</span>
                <span className={`text-xs px-2 py-0.5 rounded ${h.passou ? "bg-green-900 text-green-300" : "bg-yellow-900 text-yellow-300"}`}>
                  {h.passou ? "✓" : "!"}
                </span>
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
        <summary className="cursor-pointer text-sm text-gray-400">Verificação de compliance ({check.totalPalavras} palavras)</summary>
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
