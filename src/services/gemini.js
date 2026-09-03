import { supabase } from './supabase'

const DIRECT_GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY

/**
 * Chamada unificada para o Gemini via Supabase Edge Function com fallback local/direto.
 */
export async function callGemini(action, data = {}) {
  // 1. Tentar via Supabase Edge Function
  try {
    const { data: edgeData, error } = await supabase.functions.invoke('gemini-ai', {
      body: { action, data }
    })

    if (!error && edgeData?.ok && edgeData?.result) {
      return edgeData.result
    }
  } catch (err) {
    console.warn('[Gemini Service] Falha na Edge Function, tentando método alternativo:', err)
  }

  // 2. Se houver chave direta configurada no .env do frontend (para desenvolvimento local ágil)
  if (DIRECT_GEMINI_KEY) {
    try {
      return await callDirectGemini(action, data)
    } catch (err) {
      console.warn('[Gemini Service] Falha na chamada direta Gemini:', err)
    }
  }

  // 3. Fallback gracioso local caso a IA esteja indisponível ou sem chave
  return getLocalFallback(action, data)
}

/**
 * Chamada direta ao Gemini caso o usuário queira testar com VITE_GEMINI_API_KEY no .env
 */
async function callDirectGemini(action, data) {
  let prompt = ""
  if (action === "quote") {
    prompt = `Gere uma frase motivacional curta (máximo 25 palavras), profunda e acolhedora para uma paciente em tratamento de obesidade. Foco em constância e sem culpas. Responda apenas com a frase.`
  } else if (action === "sos_support") {
    prompt = `Uma paciente em tratamento de saúde precisa de apoio imediato contra "${data.motivo || 'desânimo'}". Retorne um JSON com {"acolhimento": "parágrafo carinhoso de 3 linhas", "passos_praticos": ["passo 1", "passo 2", "passo 3"], "mantra": "frase de segurança"}. Responda APENAS JSON.`
  } else if (action === "guardian_messages") {
    prompt = `Crie 3 opções de mensagens carinhosas de WhatsApp do guardião para a paciente (progresso: ${data.streak} dias). Retorne JSON {"opcoes": [{"titulo": "...", "mensagem": "...", "icone": "trofeu"}]}. Responda APENAS JSON.`
  } else if (action === "weekly_summary") {
    prompt = `Crie um resumo semanal empático do guardião. Retorne JSON com {"destaque_positivo": "...", "atencao_amorosa": "...", "dica_para_guardiao": "..."}. Responda APENAS JSON.`
  } else if (action === "daily_mission") {
    prompt = `Gere uma micro-missão diária gentil, realizável e motivadora (máximo 15 palavras) para uma paciente em tratamento de emagrecimento saudável (humor: ${data.humor || 'bem'}, sequência: ${data.streak || 0} dias). Retorne APENAS um JSON: {"missao": "texto da missão", "dica": "uma linha de carinho"}. Responda APENAS JSON.`
  }

  const models = ['gemini-2.5-flash', 'gemini-flash-latest', 'gemini-2.5-flash-lite']
  let json = null

  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${DIRECT_GEMINI_KEY}`
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }]
        })
      })
      if (res.ok) {
        json = await res.json()
        break
      }
    } catch {
      // continua para próximo modelo
    }
  }

  if (!json) return getLocalFallback(action, data)
  let text = json.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || ""
  text = text.replace(/^```json\s*/, '').replace(/\s*```$/, '').replace(/^```\s*/, '')

  try {
    return JSON.parse(text)
  } catch {
    return { text }
  }
}

/**
 * Fallbacks locais inteligentes e humanos para manter o app 100% funcional sempre
 */
function getLocalFallback(action, _data) {
  if (action === 'quote') {
    const quotes = [
      'Constância não é nunca errar, é não desistir de voltar.',
      'Um tropeço não apaga o caminho lindo que você já trilhou até aqui.',
      'Hoje é uma nova página. Respire fundo e faça o seu melhor no próximo prato.',
      'Cuidar de você é um ato de amor diário, sem pressa e sem culpa.',
      'Pequenas escolhas conscientes hoje criam a sua grande transformação amanhã.'
    ]
    const chosen = quotes[Math.floor(Math.random() * quotes.length)]
    return { text: chosen }
  }

  if (action === 'sos_support') {
    return {
      acolhimento: 'Respire fundo. O que você está sentindo agora é passageiro e totalmente humano. Um momento difícil ou uma refeição fora do plano não diminuem a sua força nem anulam suas vitórias.',
      passos_praticos: [
        'Beba 1 copo grande de água devagar agora mesmo.',
        'Faça 3 respirações profundas: inspire contando até 4 e solte contando até 6.',
        'Não tente compensar pulando a próxima refeição; siga seu ritmo normal com carinho.'
      ],
      mantra: 'Eu sou maior que qualquer recaída e posso recomeçar agora mesmo.'
    }
  }

  if (action === 'guardian_messages') {
    return {
      opcoes: [
        {
          titulo: 'Parabenizar Constância',
          mensagem: `Oi meu amor! Vi que você completou mais um dia firme na sua rotina. Tenho tanto orgulho da sua dedicação e força! Tamo junto! 🔥❤️`,
          icone: 'trofeu'
        },
        {
          titulo: 'Lembrete de Hidratação',
          mensagem: `Passando rapidinho para te lembrar da sua aguinha e das proteínas hoje! Estou aqui torcendo por você a cada instante! 💧🥩`,
          icone: 'agua'
        },
        {
          titulo: 'Apoio e Conexão',
          mensagem: `Oi vida! Como você está se sentindo hoje? Passando pra te lembrar que estou do seu lado em cada vitória e em cada tropeço. Um beijo enorme! 💜`,
          icone: 'coracao'
        }
      ]
    }
  }

  if (action === 'weekly_summary') {
    return {
      destaque_positivo: 'A paciente manteve uma presença constante esta semana, reforçando hábitos diários essenciais e demonstrando compromisso com o seu bem-estar.',
      atencao_amorosa: 'Fique atento aos momentos de cansaço no fim da tarde ou após dias intensos; uma palavra de incentivo faz toda a diferença nesses momentos.',
      dica_para_guardiao: 'Mande uma mensagem surpresa reforçando quanto você admira o esforço dela, independentemente do número na balança.'
    }
  }

  if (action === 'daily_mission') {
    const missoes = [
      { missao: 'Beba 1 copo grande de água antes da próxima refeição.', dica: 'Ajuda na digestão e na saciedade natural.' },
      { missao: 'Caminhe por 10 minutos hoje no seu próprio ritmo.', dica: 'Movimento leve que acalma a mente e o corpo.' },
      { missao: 'Coma a porção de proteína e salada antes do carboidrato.', dica: 'Controla a glicemia e prolonga sua saciedade.' },
      { missao: 'Tire 3 minutos para respirar fundo e soltar a tensão dos ombros.', dica: 'Pausa consciente reduz a fome emocional.' },
      { missao: 'Troque um refrigerante por água com gotas de limão fresco.', dica: 'Hidratação saborosa sem sobrecarregar o organismo.' },
      { missao: 'Mastigue com calma e pouse os talheres entre as garfadas.', dica: 'Dá tempo ao cérebro para registrar a saciedade.' },
      { missao: 'Desligue as telas 20 minutos antes de se deitar esta noite.', dica: 'Um sono reparador regula os hormônios da fome.' }
    ]
    return missoes[Math.floor(Math.random() * missoes.length)]
  }

  return {}
}
