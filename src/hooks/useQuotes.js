import { useState, useEffect } from 'react'
import { getRandomQuote } from '../services/supabase'

export function useQuotes() {
  const [quote, setQuote] = useState('')

  useEffect(() => {
    async function fetchQuote() {
      try {
        const frase = await getRandomQuote('geral')
        setQuote(frase)
      } catch {
        setQuote('Um dia difícil não anula uma semana inteira de esforço. Recomeçar faz parte do plano.')
      }
    }

    fetchQuote()
  }, [])

  return quote
}
