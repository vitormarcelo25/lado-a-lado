import { useState, useEffect } from 'react'
import { getRandomQuote } from '../services/supabase'
import { callGemini } from '../services/gemini'

export function useQuotes({ streak = 0, humor = 'bem' } = {}) {
  const [quote, setQuote] = useState('')
  const [isAiGenerated, setIsAiGenerated] = useState(false)

  useEffect(() => {
    async function fetchQuote() {
      const todayKey = `lado_ai_quote_${new Date().toISOString().slice(0, 10)}`
      const cached = localStorage.getItem(todayKey)

      if (cached) {
        try {
          const parsed = JSON.parse(cached)
          setQuote(parsed.text)
          setIsAiGenerated(parsed.isAi ?? true)
          return
        } catch {
          // segue para busca se o parse falhar
        }
      }

      try {
        const aiResult = await callGemini('quote', { streak, humor })
        const text = aiResult?.text || aiResult
        if (text && typeof text === 'string') {
          setQuote(text)
          setIsAiGenerated(true)
          localStorage.setItem(todayKey, JSON.stringify({ text, isAi: true }))
          return
        }
      } catch (err) {
        console.warn('Falha ao obter frase por IA:', err)
      }

      try {
        const frase = await getRandomQuote('geral')
        setQuote(frase)
        setIsAiGenerated(false)
        localStorage.setItem(todayKey, JSON.stringify({ text: frase, isAi: false }))
      } catch {
        const fallback = 'Um dia difícil não anula uma semana inteira de esforço. Recomeçar faz parte do plano.'
        setQuote(fallback)
        setIsAiGenerated(false)
      }
    }

    fetchQuote()
  }, [streak, humor])

  return { quote, isAiGenerated }
}

