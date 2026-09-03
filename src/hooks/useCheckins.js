import { useState, useEffect, useCallback } from 'react'
import { getTodayCheckin, upsertTodayCheckin } from '../services/supabase'

export function useCheckins() {
  const [checkin, setCheckin] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchCheckin = useCallback(async () => {
    try {
      const data = await getTodayCheckin()
      setCheckin(data)
    } catch (err) {
      console.error('Erro ao buscar check-in:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCheckin()
  }, [fetchCheckin])

  const toggle = useCallback(async (field) => {
    const newValue = !checkin?.[field]
    setCheckin(prev => ({ ...prev, [field]: newValue }))

    try {
      const updated = await upsertTodayCheckin({ [field]: newValue })
      setCheckin(updated)
    } catch (err) {
      console.error('Erro ao atualizar check-in:', err)
      setCheckin(prev => ({ ...prev, [field]: !newValue }))
    }
  }, [checkin])

  const setHumor = useCallback(async (humor) => {
    setCheckin(prev => ({ ...prev, humor }))

    try {
      const updated = await upsertTodayCheckin({ humor })
      setCheckin(updated)
    } catch (err) {
      console.error('Erro ao atualizar humor:', err)
    }
  }, [])

  return { checkin, loading, toggle, setHumor, refetch: fetchCheckin }
}
