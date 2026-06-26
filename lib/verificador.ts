// ============================================================
// VERIFICADOR DE COMPLIANCE — checa critérios de reprovação (Slide 7)
// Roda sobre o roteiro gerado. Cada item é critério de ELIMINAÇÃO.
// ============================================================

export interface ResultadoCheck {
  passou: boolean;
  alertas: { regra: string; status: "ok" | "falha" | "atencao"; detalhe: string }[];
  totalPalavras: number;
}

const ABERTURAS_GENERICAS = [
  "olá", "ola", "você sabia", "voce sabia", "nesse vídeo",
  "nesse video", "neste vídeo", "fala galera", "e aí pessoal", "oi gente",
];

export function verificarRoteiro(
  headline: string,
  hook: string,
  corpo: string
): ResultadoCheck {
  const alertas: ResultadoCheck["alertas"] = [];
  const corpoLimpo = corpo.trim();
  const palavras = corpoLimpo.split(/\s+/).filter(Boolean);
  const totalPalavras = palavras.length;

  // Headline: máx 9 palavras
  const palavrasHeadline = headline.trim().split(/\s+/).filter(Boolean).length;
  if (palavrasHeadline >= 10) {
    alertas.push({ regra: "Headline ≤ 9 palavras", status: "falha", detalhe: `Tem ${palavrasHeadline} palavras.` });
  } else {
    alertas.push({ regra: "Headline ≤ 9 palavras", status: "ok", detalhe: `${palavrasHeadline} palavras.` });
  }

  // Hook: máx 3 períodos
  const periodos = hook.split(/[.!?]+/).filter((p) => p.trim().length > 0).length;
  if (periodos > 3) {
    alertas.push({ regra: "Hook ≤ 3 períodos", status: "falha", detalhe: `Tem ${periodos} períodos.` });
  } else {
    alertas.push({ regra: "Hook ≤ 3 períodos", status: "ok", detalhe: `${periodos} período(s).` });
  }

  // Abertura genérica
  const inicioTexto = (hook + " " + corpoLimpo).toLowerCase().slice(0, 40);
  const generica = ABERTURAS_GENERICAS.find((g) => inicioTexto.includes(g));
  if (generica) {
    alertas.push({ regra: "Sem abertura genérica", status: "falha", detalhe: `Detectado: "${generica}".` });
  } else {
    alertas.push({ regra: "Sem abertura genérica", status: "ok", detalhe: "Abertura específica." });
  }

  // Corpo: 150-430 palavras
  if (totalPalavras < 150) {
    alertas.push({ regra: "Corpo 150-430 palavras", status: "falha", detalhe: `Apenas ${totalPalavras} palavras (mín. 150).` });
  } else if (totalPalavras > 430) {
    alertas.push({ regra: "Corpo 150-430 palavras", status: "falha", detalhe: `${totalPalavras} palavras (máx. 430).` });
  } else {
    alertas.push({ regra: "Corpo 150-430 palavras", status: "ok", detalhe: `${totalPalavras} palavras.` });
  }

  // Número sem fonte aparente (heurística: tem número mas não menciona fonte)
  const temNumero = /\bR?\$?\s?\d/.test(corpoLimpo);
  const temFonte = /(fonte|segundo|de acordo|diário oficial|certidão|certidao|documento|processo|cartório|cartorio|direct data|contrato)/i.test(corpoLimpo);
  if (temNumero && !temFonte) {
    alertas.push({ regra: "Dados com fonte declarada", status: "atencao", detalhe: "Há números, mas nenhuma fonte foi detectada. Revise manualmente." });
  } else {
    alertas.push({ regra: "Dados com fonte declarada", status: "ok", detalhe: temNumero ? "Fonte detectada." : "Sem números a verificar." });
  }

  // Termos de risco
  const termosRisco = ["laranja", "sonegação", "sonegacao", "empresa fantasma"];
  const termoEncontrado = termosRisco.find((t) => corpoLimpo.toLowerCase().includes(t));
  const temAcusacaoFormal = /(processo|denúncia|denuncia|acusação formal|acusacao formal|ministério público|ministerio publico|investigação formal)/i.test(corpoLimpo);
  if (termoEncontrado && !temAcusacaoFormal) {
    alertas.push({ regra: "Termos de risco só com acusação formal", status: "atencao", detalhe: `Termo "${termoEncontrado}" sem referência a processo/acusação formal.` });
  } else if (termoEncontrado) {
    alertas.push({ regra: "Termos de risco só com acusação formal", status: "ok", detalhe: "Termo usado com referência formal." });
  } else {
    alertas.push({ regra: "Termos de risco só com acusação formal", status: "ok", detalhe: "Nenhum termo de risco." });
  }

  // Linguagem condicional (boa prática)
  const temCondicional = /(teria|seria|estaria|haveria|poderia)/i.test(corpoLimpo);
  alertas.push({
    regra: "Linguagem condicional presente",
    status: temCondicional ? "ok" : "atencao",
    detalhe: temCondicional ? "Uso de condicional detectado." : "Considere 'teria/seria' para afirmações sensíveis.",
  });

  const passou = !alertas.some((a) => a.status === "falha");
  return { passou, alertas, totalPalavras };
}
