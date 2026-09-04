import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase, subscribeGuardianNotifications, salvarDeviceToken, removeChannel } from '../services/supabase'
import { solicitarTokenFCM, escutarMensagensEmTempoReal } from '../services/firebase'

const CACHE_KEY = 'lado_a_lado_guardian_notifs'
const Fired_KEY = 'lado_a_lado_fired_notifs'
const FCM_TOKEN_KEY = 'lado_a_lado_fcm_token'

function carregarCache() {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY)) || []
  } catch {
    return []
  }
}

function salvarCache(data) {
  localStorage.setItem(CACHE_KEY, JSON.stringify(data))
}

function jaDisparou(id) {
  try {
    const fired = JSON.parse(localStorage.getItem(Fired_KEY)) || {}
    return !!fired[id]
  } catch {
    return false
  }
}

function marcarDisparou(id) {
  try {
    const fired = JSON.parse(localStorage.getItem(Fired_KEY)) || {}
    fired[id] = new Date().toISOString().slice(0, 10)
    localStorage.setItem(Fired_KEY, JSON.stringify(fired))
  } catch { /* ignore */ }
}

async function mostrarNotificacao(title, options) {
  if (Notification.permission !== 'granted') return
  if ('serviceWorker' in navigator) {
    try {
      const reg = await navigator.serviceWorker.ready
      if (reg) {
        await reg.showNotification(title, options)
        return
      }
    } catch (e) {
      console.error('Erro SW notif:', e)
    }
  }
  try {
    new Notification(title, options)
  } catch (e) {
    console.error('Erro fallback notif:', e)
  }
}

export function useNotifications() {
  const [suportado, setSuportado] = useState(false)
  const [permissao, setPermissao] = useState('default')
  const [agendado, setAgendado] = useState(false)
  const channelRef = useRef(null)
  const unsubFCM = useRef(null)

  useEffect(() => {
    if ('Notification' in window) {
      setSuportado(true)
      setPermissao(Notification.permission)
    }
  }, [])

  useEffect(() => {
    return () => {
      if (channelRef.current) removeChannel(channelRef.current)
      if (unsubFCM.current) unsubFCM.current()
    }
  }, [])

  const registrarTokenFCM = useCallback(async () => {
    try {
      const token = await solicitarTokenFCM()
      if (token) {
        localStorage.setItem(FCM_TOKEN_KEY, token)
        await salvarDeviceToken(token)
      }
    } catch { /* ignore - Firebase pode nao estar configurado */ }
  }, [])

  const iniciarListenerFCM = useCallback(() => {
    if (unsubFCM.current) return

    try {
      unsubFCM.current = escutarMensagensEmTempoReal((payload) => {
        const title = payload.notification?.title || 'Lado a Lado'
        const body = payload.notification?.body || ''

        if (Notification.permission === 'granted') {
          mostrarNotificacao(title, {
            body,
            icon: '/icon-192.png',
          })
        }
      })
    } catch { /* Firebase nao configurado ainda */ }
  }, [])

  const solicitarPermissao = useCallback(async () => {
    if (!suportado) return

    const resultado = await Notification.requestPermission()
    setPermissao(resultado)

    if (resultado === 'granted') {
      mostrarNotificacao('Lado a Lado', {
        body: 'Lembretes ativados! Estaremos juntos no seu processo.',
        icon: '/icon-192.png',
        tag: 'boas-vindas',
      })

      await registrarTokenFCM()
      iniciarListenerFCM()
    }
  }, [suportado, registrarTokenFCM, iniciarListenerFCM])

  const verificarLembreteNoturno = useCallback(async () => {
    if (permissao !== 'granted') return

    try {
      const hoje = new Date().toISOString().slice(0, 10)
      const { data } = await supabase
        .from('daily_checkins')
        .select('id')
        .eq('data', hoje)
        .maybeSingle()

      if (!data) {
        mostrarNotificacao('Seu cantinho do dia', {
          body: 'Hora do seu check-in de 1 minuto antes de descansar. Como foram as coisas hoje?',
          icon: '/icon-192.png',
          tag: 'lembrete-noturno',
        })
      }
    } catch { /* offline */ }
  }, [permissao])

  const verificarAlertaMounjaro = useCallback(async () => {
    if (permissao !== 'granted') return

    try {
      const { data } = await supabase
        .from('mounjaro_applications')
        .select('data_aplicacao')
        .order('data_aplicacao', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (data?.data_aplicacao) {
        const ultima = new Date(data.data_aplicacao)
        const hoje = new Date()
        const dias = Math.floor((hoje - ultima) / (1000 * 60 * 60 * 24))

        if (dias >= 7) {
          mostrarNotificacao('Ciclo do Mounjaro', {
            body: 'Ja se passaram 7 dias desde a ultima dose. Lembre-se de registrar quando aplicar!',
            icon: '/icon-192.png',
            tag: 'alerta-mounjaro',
          })
        }
      }
    } catch { /* offline */ }
  }, [permissao])

  const verificarIncentivoAgua = useCallback(() => {
    if (permissao !== 'granted') return

    mostrarNotificacao('Hora de beber agua', {
      body: 'Que tal tomar um copo de agua agora? Hidratacao e essencial!',
      icon: '/icon-192.png',
      tag: 'incentivo-agua',
    })
  }, [permissao])

  const sincronizarNotificacoes = useCallback(async () => {
    try {
      const { data } = await supabase
        .from('guardian_notifications')
        .select('*')
        .eq('ativa', true)

      if (data) salvarCache(data)
      return data || carregarCache()
    } catch {
      return carregarCache()
    }
  }, [])

  const dispararNotificacoesGuardiao = useCallback((notificacoes) => {
    if (permissao !== 'granted') return

    const agora = new Date()
    const horarioAtual = agora.toTimeString().slice(0, 5)
    const hojeStr = agora.toISOString().slice(0, 10)

    for (const notif of notificacoes) {
      const horarioNotif = notif.horario?.slice(0, 5)
      if (horarioNotif !== horarioAtual) continue

      const fireKey = `${notif.id}-${hojeStr}`
      if (jaDisparou(fireKey)) continue

      mostrarNotificacao(notif.titulo, {
        body: notif.mensagem,
        icon: '/icon-192.png',
        tag: `guardian-${notif.id}`,
      })
      marcarDisparou(fireKey)
    }
  }, [permissao])

  const iniciarRealtimeGuardiao = useCallback(() => {
    if (permissao !== 'granted') return
    if (channelRef.current) return

    channelRef.current = subscribeGuardianNotifications((payload) => {
      if (payload.event === 'INSERT' && payload.new?.ativa) {
        const notif = payload.new
        const cache = carregarCache()
        cache.push(notif)
        salvarCache(cache)

        const horarioAlvo = notif.horario?.slice(0, 5)
        const agora = new Date().toTimeString().slice(0, 5)

        if (horarioAlvo === agora) {
          const fireKey = `${notif.id}-${new Date().toISOString().slice(0, 10)}`
          if (!jaDisparou(fireKey)) {
            mostrarNotificacao(notif.titulo, {
              body: notif.mensagem,
              icon: '/icon-192.png',
              tag: `guardian-${notif.id}`,
            })
            marcarDisparou(fireKey)
          }
        }
      }
    })
  }, [permissao])

  const agendarVerificacoes = useCallback(() => {
    if (agendado) return
    setAgendado(true)

    // FCM: registrar token e escutar foreground messages
    if (permissao === 'granted') {
      registrarTokenFCM()
      iniciarListenerFCM()
    }

    // Realtime (instantaneo quando online)
    iniciarRealtimeGuardiao()

    // Lembretes noturnos, de agua, e de Mounjaro
    // Agora sao processados 100% pelo Backend via pg_cron + Edge Functions
    // Nao precisamos mais de setTimeouts aqui que so disparam ao abrir o app.

  }, [agendado, iniciarRealtimeGuardiao, permissao, registrarTokenFCM, iniciarListenerFCM])

  return {
    suportado,
    permissao,
    solicitarPermissao,
    agendarVerificacoes,
  }
}
