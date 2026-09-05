import { useState, useEffect, useCallback, useRef } from 'react'
import { startAlarmSound, stopAlarmSound } from '../utils/alarmSound'

const STORAGE_KEY = 'lado_a_lado_agenda_items'

export const CATEGORIAS = [
  { id: 'geral', label: 'Geral', cor: 'bg-slate-100 text-slate-700' },
  { id: 'refeicao', label: 'Refeição / Lanche', cor: 'bg-emerald-100 text-emerald-800' },
  { id: 'agua', label: 'Beber Água', cor: 'bg-blue-100 text-blue-800' },
  { id: 'medicamento', label: 'Remédio / Injeção', cor: 'bg-violet-100 text-violet-800' },
  { id: 'exercicio', label: 'Caminhada / Treino', cor: 'bg-amber-100 text-amber-800' },
  { id: 'pausa', label: 'Descanso / Respiração', cor: 'bg-rose-100 text-rose-800' },
]

function getLocalNow() {
  const d = new Date()
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  return {
    date: `${year}-${month}-${day}`,
    time: `${hours}:${minutes}`,
    fullDate: d
  }
}

function carregarItens() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw)
  } catch {
    return []
  }
}

function salvarItens(itens) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(itens))
  } catch {
    // ignore
  }
}

async function dispararNotificacaoNativa(titulo, corpo, itemId) {
  if (typeof window === 'undefined' || !('Notification' in window)) return

  // Se ainda não pediu permissão, pede agora
  if (Notification.permission === 'default') {
    try {
      await Notification.requestPermission()
    } catch {
      // ignore
    }
  }

  if (Notification.permission !== 'granted') return

  const options = {
    body: corpo,
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: `lembrete-${itemId || Date.now()}`,
    renotify: true,
    requireInteraction: true,
    vibrate: [400, 150, 400, 150, 600],
    data: { url: '/' }
  }

  if ('serviceWorker' in navigator) {
    try {
      const reg = await Promise.race([
        navigator.serviceWorker.ready,
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 800))
      ])
      if (reg && reg.showNotification) {
        await reg.showNotification(titulo, options)
        return
      }
    } catch {
      // fallback
    }
  }

  try {
    new Notification(titulo, options)
  } catch {
    // ignore
  }
}

export function useAgenda() {
  const [itens, setItens] = useState(() => carregarItens())
  const [alarmeAtivo, setAlarmeAtivo] = useState(null)
  const [cardNotificacao, setCardNotificacao] = useState(null)
  const checandoRef = useRef(false)

  // Persistir itens quando houver alteração
  useEffect(() => {
    salvarItens(itens)
  }, [itens])

  // Desligar alarme quando desmontar
  useEffect(() => {
    return () => {
      stopAlarmSound()
    }
  }, [])

  const adicionarItem = useCallback(({ titulo, data, horario, categoria = 'geral', observacao = '' }) => {
    if (!titulo?.trim() || !data || !horario) return null

    // Pedir permissão de notificações do navegador se ainda não concedida
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {})
    }

    const novo = {
      id: `agenda_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      titulo: titulo.trim(),
      data, // YYYY-MM-DD
      horario, // HH:MM
      categoria,
      observacao: observacao.trim(),
      concluido: false,
      notificado: false,
      criadoEm: new Date().toISOString()
    }

    setItens(prev => {
      const atualizados = [...prev, novo].sort((a, b) => {
        const dataA = `${a.data}T${a.horario}`
        const dataB = `${b.data}T${b.horario}`
        return dataA.localeCompare(dataB)
      })
      return atualizados
    })

    return novo
  }, [])

  const removerItem = useCallback((id) => {
    setItens(prev => prev.filter(item => item.id !== id))
    if (alarmeAtivo?.id === id) {
      stopAlarmSound()
      setAlarmeAtivo(null)
    }
    if (cardNotificacao?.id === id) {
      setCardNotificacao(null)
    }
  }, [alarmeAtivo, cardNotificacao])

  const alternarConcluido = useCallback((id) => {
    setItens(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, concluido: !item.concluido }
      }
      return item
    }))
    if (alarmeAtivo?.id === id) {
      stopAlarmSound()
      setAlarmeAtivo(null)
    }
    if (cardNotificacao?.id === id) {
      setCardNotificacao(null)
    }
  }, [alarmeAtivo, cardNotificacao])

  const pararAlarme = useCallback(() => {
    stopAlarmSound()
    setAlarmeAtivo(null)
  }, [])

  const concluirAlarme = useCallback(() => {
    if (alarmeAtivo) {
      alternarConcluido(alarmeAtivo.id)
    }
    stopAlarmSound()
    setAlarmeAtivo(null)
    setCardNotificacao(null)
  }, [alarmeAtivo, alternarConcluido])

  const adiarAlarme = useCallback((minutos = 5) => {
    const alvo = alarmeAtivo || cardNotificacao
    if (!alvo) return

    const agora = new Date()
    agora.setMinutes(agora.getMinutes() + minutos)
    const year = agora.getFullYear()
    const month = String(agora.getMonth() + 1).padStart(2, '0')
    const day = String(agora.getDate()).padStart(2, '0')
    const hours = String(agora.getHours()).padStart(2, '0')
    const mins = String(agora.getMinutes()).padStart(2, '0')

    const novaData = `${year}-${month}-${day}`
    const novoHorario = `${hours}:${mins}`

    setItens(prev => prev.map(item => {
      if (item.id === alvo.id) {
        return {
          ...item,
          data: novaData,
          horario: novoHorario,
          notificado: false
        }
      }
      return item
    }))

    stopAlarmSound()
    setAlarmeAtivo(null)
    setCardNotificacao(null)
  }, [alarmeAtivo, cardNotificacao])

  const fecharCardNotificacao = useCallback(() => {
    setCardNotificacao(null)
  }, [])

  // Verificador contínuo de alarmes (a cada 3 segundos)
  useEffect(() => {
    const verificar = () => {
      if (checandoRef.current) return
      checandoRef.current = true

      try {
        const { date: hoje, time: horaAtual } = getLocalNow()

        setItens(prev => {
          let houveDisparo = false
          let alarmeDisparado = null

          const novos = prev.map(item => {
            // Se já foi concluído ou já foi notificado hoje, não dispara
            if (item.concluido || item.notificado) return item

            // Verifica se chegou o momento (mesmo dia ou atrasado no mesmo dia, e hora atual >= hora agendada)
            if (item.data === hoje && horaAtual >= item.horario) {
              if (!houveDisparo && !alarmeAtivo) {
                houveDisparo = true
                alarmeDisparado = item
              }
              return { ...item, notificado: true }
            }

            // Se for de um dia anterior que passou sem notificar
            if (item.data < hoje) {
              return { ...item, notificado: true }
            }

            return item
          })

          if (alarmeDisparado && !alarmeAtivo) {
            setAlarmeAtivo(alarmeDisparado)
            setCardNotificacao(alarmeDisparado)
            startAlarmSound()
            dispararNotificacaoNativa(
              `⏰ Lembrete: ${alarmeDisparado.titulo}`,
              `Horário marcado: ${alarmeDisparado.horario}${alarmeDisparado.observacao ? ` • ${alarmeDisparado.observacao}` : ''}`,
              alarmeDisparado.id
            )
          }

          return novos
        })
      } finally {
        checandoRef.current = false
      }
    }

    // Checar imediatamente
    verificar()

    // Rodar a cada 3 segundos
    const interval = setInterval(verificar, 3000)
    return () => clearInterval(interval)
  }, [alarmeAtivo])

  return {
    itens,
    alarmeAtivo,
    cardNotificacao,
    adicionarItem,
    removerItem,
    alternarConcluido,
    pararAlarme,
    concluirAlarme,
    adiarAlarme,
    fecharCardNotificacao
  }
}
