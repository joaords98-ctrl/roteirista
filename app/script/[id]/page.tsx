"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase-client";

export default function ScriptPage() {
  const router = useRouter();
  const params = useParams();
  const supabase = createClient();
  const [r, setR] = useState<any>(null);
  const [metricas, setMetricas] = useState({ views: "", retencao: "", compartilhamentos: "", seguidores_gerados: "" });
  const [salvo, setSalvo] = useState(false);

  useEffect(() => { carregar(); }, []);

  async function carregar() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }
    const { data } = await supabase.from("roteiros").select("*").eq("id", params.id).single();
    if (!data) { router.push("/dashboard"); return; }
    setR(data);
    setMetricas({
      views: data.views ?? "", retencao: data.retencao ?? "",
      compartilhamentos: data.compartilhamentos ?? "", seguidores_gerados: data.seguidores_gerados ?? "",
    });
  }

  async function salvarMetricas() {
    await supabase.from("roteiros").update({
      views: Number(metricas.views) || null,
      retencao: Number(metricas.retencao) || null,
      compartilhamentos: Number(metricas.compartilhamentos) || null,
      seguidores_gerados: Number(metricas.seguidores_gerados) || null,
      publicado: true,
    }).eq("id", params.id);
    setSalvo(true);
    setTimeout(() => setSalvo(false), 2000);
  }

  if (!r) return <div className="min-h-screen flex items-center justify-center text-gray-500">Carregando...</div>;
  const c = r.conteudo;

  return (
    <div className="min-h-screen max-w-3xl mx-auto p-4 md:p-8">
      <button onClick={() => router.push(r.missao_id ? `/missao/${r.missao_id}` : "/dashboard")} className="text-sm text-gray-400 mb-6">← Voltar</button>

      <div className="bg-[#13131a] border border-[#26262f] rounded-2xl p-6 mb-6">
        <div className="text-xs text-red-500 mb-1">HEADLINE</div>
        <div className="font-bold text-lg mb-4">{c.headline}</div>
        <div className="text-xs text-red-500 mb-1">HOOK</div>
        <div className="mb-4">{c.hook}</div>
        {c.blocos?.map((b: any) => (
          <div key={b.numero} className="mb-3 p-3 bg-[#0a0a0f] rounded-lg border border-[#26262f]">
            <div className="text-xs text-gray-500 mb-1">BLOCO {b.numero} — {b.titulo}</div>
            <div className="text-sm">{b.texto}</div>
          </div>
        ))}
        <div className="mt-3 p-3 bg-[#0a0a0f] rounded-lg border border-red-900">
          <div className="text-xs text-red-500 mb-1">CTA</div>
          <div>{c.cta}</div>
        </div>
      </div>

      {/* Ciclo de aprendizado: métricas reais */}
      <div className="bg-[#13131a] border border-[#26262f] rounded-2xl p-6">
        <h2 className="font-semibold mb-1">Resultados do vídeo</h2>
        <p className="text-xs text-gray-500 mb-4">Informe os dados após publicar — é assim que o sistema aprende seus padrões.</p>
        <div className="grid grid-cols-2 gap-3 mb-4">
          {[
            ["Visualizações", "views"], ["Retenção (%)", "retencao"],
            ["Compartilhamentos", "compartilhamentos"], ["Seguidores gerados", "seguidores_gerados"],
          ].map(([label, k]) => (
            <input key={k} placeholder={label} type="number"
              value={(metricas as any)[k]}
              onChange={(e) => setMetricas({ ...metricas, [k]: e.target.value })}
              className="px-3 py-2 bg-[#0a0a0f] border border-[#26262f] rounded-lg outline-none focus:border-red-500" />
          ))}
        </div>
        <button onClick={salvarMetricas}
          className="w-full py-3 bg-red-600 hover:bg-red-700 rounded-lg font-semibold">
          {salvo ? "Salvo ✓" : "Salvar resultados"}
        </button>
      </div>
    </div>
  );
}
