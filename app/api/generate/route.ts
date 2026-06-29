import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { montarSystemPrompt, PerfilCriador } from "@/lib/metodologia";
import { verificarRoteiro } from "@/lib/verificador";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { tema, material, missao_id } = await req.json();
    if (!tema || tema.trim().length < 3) {
      return NextResponse.json({ error: "Descreva o tema/apuração do roteiro." }, { status: 400 });
    }
    if (!missao_id) {
      return NextResponse.json({ error: "Roteiro precisa pertencer a uma missão." }, { status: 400 });
    }

    // Carregar contexto da Missão
    const { data: missaoRow } = await supabase
      .from("missoes")
      .select("titulo, objetivo, publico, plataforma")
      .eq("id", missao_id)
      .eq("user_id", user.id)
      .single();

    // Carregar perfil (Camada 2) do usuário
    const { data: perfilRow } = await supabase
      .from("perfis")
      .select("*")
      .eq("user_id", user.id)
      .single();

    const perfil: PerfilCriador | null = perfilRow
      ? {
          nicho: perfilRow.nicho,
          tom: perfilRow.tom,
          abordagem: perfilRow.abordagem,
          estilo: perfilRow.estilo,
          formato: perfilRow.formato,
          aparece: perfilRow.aparece,
          duracao: perfilRow.duracao,
          publico: perfilRow.publico,
          dna: perfilRow.dna,
        }
      : null;

    const systemPrompt = montarSystemPrompt(perfil, missaoRow);

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "GEMINI_API_KEY não configurada na Vercel." }, { status: 500 });
    }

    const userMessage = `APURAÇÃO / TEMA:
${tema}

${material ? `MATERIAL DE APOIO (fatos, números, fontes apuradas):\n${material}` : "OBS: sem material bruto fornecido. Use placeholders entre [colchetes] onde o criador deve inserir números/fontes reais — NUNCA invente fatos."}

Gere o roteiro completo seguindo a metodologia. Responda APENAS em JSON válido, sem texto fora do JSON, neste formato exato:
{
  "headline": "texto de tela, máx 9 palavras, com MGC",
  "hook": "primeira frase falada, 1-3 períodos, com número específico",
  "blocos": [
    {"numero": 1, "titulo": "Abertura", "texto": "..."},
    {"numero": 2, "titulo": "Contexto e protagonismo", "texto": "..."},
    {"numero": 3, "titulo": "Desenvolvimento", "texto": "..."},
    {"numero": 4, "titulo": "A bomba", "texto": "..."},
    {"numero": 5, "titulo": "Fechamento + CTA", "texto": "..."}
  ],
  "cta": "chamada final justificada para seguir",
  "mgc_usados": ["lista dos mecanismos de curiosidade aplicados"],
  "notas_compliance": "observações sobre fontes/condicional/contraditório"
}`;

    const modelo = process.env.GEMINI_MODEL || "gemini-2.0-flash";
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents: [{ role: "user", parts: [{ text: userMessage }] }],
          generationConfig: {
            maxOutputTokens: 3000,
            responseMimeType: "application/json",
          },
        }),
      }
    );

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error("Gemini error:", errText);
      let detalhe = errText;
      try {
        const ej = JSON.parse(errText);
        detalhe = ej?.error?.message || errText;
      } catch {}
      return NextResponse.json(
        { error: `Erro Gemini (${geminiRes.status}): ${detalhe}` },
        { status: 502 }
      );
    }

    const geminiData = await geminiRes.json();
    const raw = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const clean = raw.replace(/```json|```/g, "").trim();

    let roteiro;
    try {
      roteiro = JSON.parse(clean);
    } catch {
      return NextResponse.json({ error: "A IA retornou formato inesperado. Tente de novo." }, { status: 502 });
    }

    // Verificação automática (Slide 7)
    const corpoCompleto = (roteiro.blocos || []).map((b: any) => b.texto).join(" ");
    const check = verificarRoteiro(roteiro.headline || "", roteiro.hook || "", corpoCompleto);

    // Salvar no banco
    const { data: saved } = await supabase
      .from("roteiros")
      .insert({
        user_id: user.id,
        missao_id,
        tema,
        conteudo: roteiro,
        check_resultado: check,
        passou: check.passou,
      })
      .select()
      .single();

    return NextResponse.json({ roteiro, check, id: saved?.id });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Erro interno" }, { status: 500 });
  }
}
