import { useState, useEffect } from 'react'
import { getRecentCheckins } from '../services/supabase'

export function useStreak() {
  const [streak, setStreak] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function calculateStreak() {
      try {
        const checkins = await getRecentCheckins(90)
        const datesWithCheckin = new Set(
          checkins
            .filter(c => c.tomou_remedio || c.bebeu_agua || c.refeicoes_ok)
            .map(c => c.data)
        )

        let count = 0
        const today = new Date()

        for (let i = 0; i < 90; i++) {
          const d = new Date(today)
          d.setDate(d.getDate() - i)
          const dateStr = d.toISOString().slice(0, 10)

          if (datesWithCheckin.has(dateStr)) {
            count++
          } else if (i > 0) {
            break
          }
        }

        setStreak(count)
      } catch (err) {
        console.error('Erro ao calcular streak:', err)
      } finally {
        setLoading(false)
      }
    }

    calculateStreak()
  }, [])

  return { streak, loading }
}
