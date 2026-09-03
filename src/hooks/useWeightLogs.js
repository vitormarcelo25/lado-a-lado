import { useState, useEffect, useCallback } from 'react'
import { getWeightLogs, addWeightLog, getLatestWeight } from '../services/supabase'

export function useWeightLogs() {
  const [logs, setLogs] = useState([])
  const [latest, setLatest] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchLogs = useCallback(async () => {
    try {
      const [allLogs, latestWeight] = await Promise.all([getWeightLogs(), getLatestWeight()])
      setLogs(allLogs)
      setLatest(latestWeight)
    } catch (err) {
      console.error('Erro ao buscar pesos:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  const addLog = useCallback(async (peso, cintura, nota) => {
    try {
      await addWeightLog(peso, cintura, nota)
      await fetchLogs()
    } catch (err) {
      console.error('Erro ao salvar peso:', err)
      throw err
    }
  }, [fetchLogs])

  return { logs, latest, loading, addLog, refetch: fetchLogs }
}
