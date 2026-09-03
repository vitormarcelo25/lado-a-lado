import { useState, useEffect, useCallback } from 'react'
import { getTodayMission, upsertTodayMission, toggleMission, getMissionForDate } from '../services/supabase'
import { callGemini } from '../services/gemini'

export function useDailyMission({ streak = 0, humor = 'bem', agua = 0, alimentacao = false } = {}) {
  const [mission, setMission] = useState(null)
  const [dica, setDica] = useState('')
  const [isAi, setIsAi] = useState(true)
  const [loading, setLoading] = useState(true)
  const [gerando, setGerando] = useState(false)

  const todayStr = new Date().toISOString().slice(0, 10)
  const cacheKey = `lado_ai_mission_${todayStr}`
  const cacheTipKey = `lado_ai_mission_tip_${todayStr}`

  // Carrega ou gera a missão do dia
  const carregarOuGerarMissao = useCallback(async (forcarNova = false) => {
    if (forcarNova) {
      setGerando(true)
    } else {
      setLoading(true)
    }

    try {
      // 1. Se não estamos forçando nova missão, verifica o cache local
      if (!forcarNova) {
        const cached = localStorage.getItem(cacheKey)
        const cachedTip = localStorage.getItem(cacheTipKey)
        if (cached) {
          try {
            const parsed = JSON.parse(cached)
            setMission(parsed)
            if (cachedTip) setDica(cachedTip)
            setLoading(false)
            return
          } catch {
            /* segue para busca */
          }
        }
      }

      // 2. Verifica se já existe missão gravada no Supabase para hoje
      if (!forcarNova) {
        try {
          const dbMission = await getTodayMission()
          if (dbMission && dbMission.missao) {
            setMission(dbMission)
            localStorage.setItem(cacheKey, JSON.stringify(dbMission))
            setLoading(false)
            return
          }
        } catch (err) {
          console.warn('Falha ao consultar missão no Supabase:', err)
        }
      }

      // 3. Gerar nova missão com a IA (Gemini)
      let missaoTexto = ''
      let dicaTexto = ''

      try {
        const aiResponse = await callGemini('daily_mission', {
          streak,
          humor,
          agua,
          alimentacao,
          diaSemana: new Date().toLocaleDateString('pt-BR', { weekday: 'long' })
        })

        if (aiResponse?.missao) {
          missaoTexto = aiResponse.missao
          dicaTexto = aiResponse.dica || ''
        } else if (typeof aiResponse === 'string') {
          missaoTexto = aiResponse
        }
      } catch (err) {
        console.warn('Erro ao gerar missão com IA, usando fallback:', err)
      }

      // Se a IA não retornou texto, usa a missão do dia por dia da semana
      if (!missaoTexto) {
        missaoTexto = getMissionForDate(todayStr)
        setIsAi(false)
      } else {
        setIsAi(true)
      }

      // 4. Salva a missão gerada no Supabase
      let savedMission = null
      try {
        savedMission = await upsertTodayMission(missaoTexto, false)
      } catch (err) {
        console.warn('Falha ao gravar missão no Supabase:', err)
      }

      const finalMission = savedMission || {
        id: 'local_mission_' + todayStr,
        data: todayStr,
        missao: missaoTexto,
        concluida: false
      }

      setMission(finalMission)
      setDica(dicaTexto)
      localStorage.setItem(cacheKey, JSON.stringify(finalMission))
      if (dicaTexto) {
        localStorage.setItem(cacheTipKey, dicaTexto)
      }
    } catch (err) {
      console.error('Erro geral no gerenciamento da missão:', err)
    } finally {
      setLoading(false)
      setGerando(false)
    }
  }, [streak, humor, agua, alimentacao, todayStr, cacheKey, cacheTipKey])

  useEffect(() => {
    carregarOuGerarMissao(false)
  }, [carregarOuGerarMissao])

  const toggleConcluida = useCallback(async () => {
    if (!mission) return
    const novoStatus = !mission.concluida
    const missionAtualizada = { ...mission, concluida: novoStatus }

    setMission(missionAtualizada)
    localStorage.setItem(cacheKey, JSON.stringify(missionAtualizada))

    try {
      await toggleMission(mission.id, novoStatus)
    } catch (err) {
      console.error('Erro ao atualizar status da missão:', err)
      setMission(prev => ({ ...prev, concluida: !novoStatus }))
    }
  }, [mission, cacheKey])

  const gerarNovaMissaoIA = useCallback(async () => {
    await carregarOuGerarMissao(true)
  }, [carregarOuGerarMissao])

  return {
    mission,
    dica,
    isAi,
    loading,
    gerando,
    toggleConcluida,
    gerarNovaMissaoIA
  }
}
