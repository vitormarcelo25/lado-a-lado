import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY") || Deno.env.get("VITE_GEMINI_API_KEY")
    if (!GEMINI_API_KEY) {
      return new Response(
        JSON.stringify({ error: "GEMINI_API_KEY is not configured in Supabase Secrets or Environment" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const { action, data = {} } = await req.json()

    let systemInstruction = "Você é o assistente inteligente e acolhedor do aplicativo 'Lado a Lado', um app de suporte contínuo para o tratamento da obesidade e mudança de hábitos. Sua comunicação é sempre sem julgamentos, focada em autocompaixão, consistência e suporte emocional genuíno. NUNCA seja punitivo e nunca promova dietas restritivas extremas."
    let prompt = ""

    if (action === "quote") {
      const { streak = 0, humor = "bem", alimentacao = false, agua = 0 } = data
      prompt = `Gere uma frase motivacional curta (máximo 2 frases, cerca de 25 palavras), profunda e acolhedora para a paciente ler hoje.
Contexto atual dela:
- Sequência de dias consistentes (streak): ${streak} dias
- Humor hoje: ${humor}
- Alimentação no plano hoje: ${alimentacao ? "Sim" : "Ainda não registrada"}
- Água bebida hoje: ${agua} copos

Diretrizes:
- Não seja clichê vazio.
- Foque em constância, em recomeçar a qualquer momento e afastar a culpa.
- Responda apenas com a frase, sem aspas e sem explicações adicionais.`
    } else if (action === "sos_support") {
      const { motivo = "desanimo", detalhes = "" } = data
      prompt = `A paciente acabou de acionar o botão SOS de emergência emocional por causa de: "${motivo}".
Detalhes adicionais relatados: "${detalhes || "Nenhum detalhe extra informado"}".

Por favor, forneça um acolhimento imediato em formato JSON com os seguintes campos:
1. "acolhimento": Um parágrafo curto (3 a 4 linhas), extremamente amoroso, calmante e sem nenhum tom de julgamento. Valide a dor dela e lembre que uma refeição ou momento difícil não apaga o caminho dela.
2. "passos_praticos": Uma lista com 3 micro-passos super fáceis para os próximos 15 minutos (ex: 'Beba 1 copo de água com calma', 'Faça 3 respirações lentas de 4 segundos', 'Não tente compensar pulando a próxima refeição').
3. "mantra": Uma frase curta de alívio e segurança para ela repetir mentalmente agora.

Responda APENAS com o JSON válido, sem crases de markdown (\`\`\`json).`
    } else if (action === "guardian_messages") {
      const { streak = 0, pesoPerdido = null, alimentacao = false, agua = 0, efeitos = null, vitorias = null, humor = "bem" } = data
      prompt = `Você é o co-piloto do Guardião/Mentor da paciente. O Guardião quer enviar uma mensagem pelo WhatsApp para incentivar, acolher ou dar suporte à paciente hoje.
Snapshot do estado da paciente hoje:
- Ofensiva (dias seguidos): ${streak}
- Progresso de peso: ${pesoPerdido ? `${pesoPerdido} kg eliminados` : "Tratamento em andamento"}
- Dieta hoje: ${alimentacao ? "Firme e no plano" : "Ainda não completou"}
- Água: ${agua * 250} ml
- Humor: ${humor}
- Efeitos colaterais registrados: ${efeitos ? JSON.stringify(efeitos) : "Nenhum efeito adverso relatado"}
- Vitórias não-balança relatadas: ${vitorias ? JSON.stringify(vitorias) : "Nenhuma vitória específica marcada hoje"}

Crie 3 opções de mensagens curtas de WhatsApp para o Guardião enviar para ela:
1. Uma opção carinhosa parabenizando e incentivando (Tom: celebração e orgulho)
2. Uma opção de lembrete amoroso (ex: hidratação, descanso ou nutrição)
3. Uma opção de suporte e conexão emocional (perguntando como ela está ou acolhendo)

Retorne APENAS um JSON válido no formato:
{
  "opcoes": [
    { "titulo": "Comemorar Conquistas", "mensagem": "...", "icone": "trofeu" },
    { "titulo": "Cuidado & Hidratação", "mensagem": "...", "icone": "agua" },
    { "titulo": "Abraço & Conexão", "mensagem": "...", "icone": "coracao" }
  ]
}`
    } else if (action === "weekly_summary") {
      const { streak = 0, checkinsCount = 0, pesoInicial = 0, pesoAtual = 0, vitorias = [] } = data
      prompt = `Gere um resumo semanal amoroso e analítico para o Guardião sobre a evolução da paciente.
Dados da semana:
- Dias de check-in ativos na semana: ${checkinsCount} de 7
- Sequência atual: ${streak} dias
- Peso inicial: ${pesoInicial} kg | Peso atual: ${pesoAtual} kg
- Vitórias da semana relatadas: ${JSON.stringify(vitorias)}

Retorne um JSON com:
{
  "titulo": "Resumo da Semana",
  "destaque_positivo": "Um resumo de 2 linhas destacando a constância e vitórias dela",
  "atencao_amorosa": "Um ponto onde ela pode precisar de mais suporte ou incentivo carinhoso",
  "dica_para_guardiao": "Uma ação prática para o Guardião fazer hoje por ela"
}
Responda APENAS com o JSON válido.`
    } else {
      return new Response(
        JSON.stringify({ error: "Ação não suportada" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // Chamada à API REST do Google Gemini (usando modelos ativos com fallback)
    const models = ["gemini-2.5-flash", "gemini-flash-latest", "gemini-2.5-flash-lite", "gemini-2.5-pro"]
    let geminiResponse = null
    let rawText = ""

    for (const model of models) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`
        const body = {
          contents: [
            {
              role: "user",
              parts: [{ text: `${systemInstruction}\n\n${prompt}` }]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            topP: 0.95,
          }
        }

        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body)
        })

        if (res.ok) {
          const resData = await res.json()
          rawText = resData.candidates?.[0]?.content?.parts?.[0]?.text || ""
          if (rawText) {
            geminiResponse = rawText
            break
          }
        } else {
          console.warn(`Erro no modelo ${model}:`, await res.text())
        }
      } catch (err) {
        console.warn(`Falha na tentativa com modelo ${model}:`, err)
      }
    }

    if (!geminiResponse) {
      return new Response(
        JSON.stringify({ error: "Falha ao gerar resposta com os modelos do Gemini" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // Tratamento de limpeza caso o Gemini envie blocos de código ```json
    let cleanText = geminiResponse.trim()
    if (cleanText.startsWith("```json")) {
      cleanText = cleanText.replace(/^```json\s*/, "").replace(/\s*```$/, "")
    } else if (cleanText.startsWith("```")) {
      cleanText = cleanText.replace(/^```\s*/, "").replace(/\s*```$/, "")
    }

    let parsedResult
    try {
      parsedResult = JSON.parse(cleanText)
    } catch {
      // Se não for JSON (por exemplo, na action "quote"), retorna como texto normal
      parsedResult = { text: cleanText }
    }

    return new Response(
      JSON.stringify({ ok: true, result: parsedResult }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  }
})
