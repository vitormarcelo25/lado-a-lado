import { useState, useEffect, useRef, useCallback } from 'react'
import { Clock, X } from 'lucide-react'
import { savePause, getTodayPauseCount } from '../services/supabase'

const FRASES_ANCORAGEM = [
  'Essa vontade e temporaria. Voce e mais forte que ela.',
  'Respira. Em 3 minutos isso passa.',
  'Voce nao esta com fome. Seu corpo esta pedindo conforto.',
  'O prazer do momento nao vale o peso na consciencia.',
  'Voce ja venceu isso antes. Pode vencer de novo.',
  'Atemptacao e um sinal de que voce esta crescendo.',
  'Nao e fome. E emocao. E tudo bem sentir.',
]

const FASES_RESPIRACAO = [
  { label: 'Inspire', duracao: 4, cor: 'from-blue-400 to-blue-500' },
  { label: 'Segure', duracao: 4, cor: 'from-amber-400 to-amber-500' },
  { label: 'Expire', duracao: 6, cor: 'from-emerald-400 to-emerald-500' },
]

export default function PauseButton() {
  const [aberto, setAberto] = useState(false)
  const [rodando, setRodando] = useState(false)
  const [tempoRestante, setTempoRestante] = useState(180)
  const [faseAtual, setFaseAtual] = useState(0)
  const [fraseIndex, setFraseIndex] = useState(0)
  const [pauseCount, setPauseCount] = useState(0)
  const [concluido, setConcluido] = useState(false)
  const intervalRef = useRef(null)

  useEffect(() => {
    async function load() {
      try {
        const count = await getTodayPauseCount()
        setPauseCount(count)
      } catch (err) {
        console.error('Erro ao carregar pausas:', err)
      }
    }
    load()
  }, [])

  const clearTimers = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
  }, [])

  const iniciarPausa = useCallback(() => {
    setRodando(true)
    setTempoRestante(180)
    setFaseAtual(0)
    setFraseIndex(0)
    setConcluido(false)

    let tempo = 180
    let fase = 0
    let fraseIdx = 0
    let faseTempo = FASES_RESPIRACAO[0].duracao

    intervalRef.current = setInterval(() => {
      tempo -= 1
      faseTempo -= 1

      if (tempo <= 0) {
        clearTimers()
        setRodando(false)
        setConcluido(true)
        setTempoRestante(0)
        savePause(true, 180).then(() => {
          setPauseCount(c => c + 1)
        })
        return
      }

      if (faseTempo <= 0) {
        fase = (fase + 1) % 3
        faseTempo = FASES_RESPIRACAO[fase].duracao
        fraseIdx = (fraseIdx + 1) % FRASES_ANCORAGEM.length
        setFaseAtual(fase)
        setFraseIndex(fraseIdx)
      }

      setTempoRestante(tempo)
    }, 1000)
  }, [clearTimers])

  const cancelarPausa = useCallback(() => {
    clearTimers()
    setRodando(false)
    setTempoRestante(180)
    setFaseAtual(0)
  }, [clearTimers])

  useEffect(() => {
    return () => clearTimers()
  }, [clearTimers])

  const minutos = Math.floor(tempoRestante / 60)
  const segundos = tempoRestante % 60
  const progresso = ((180 - tempoRestante) / 180) * 100
  const fase = FASES_RESPIRACAO[faseAtual]
  const circunferencia = 2 * Math.PI * 54
  const offset = circunferencia - (progresso / 100) * circunferencia

  if (!aberto) {
    return (
      <button
        onClick={() => setAberto(true)}
        className="w-full flex items-center justify-between p-4 rounded-2xl border border-amber-200 bg-amber-50 text-amber-800 cursor-pointer transition-all hover:bg-amber-100 active:scale-[0.98]"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <div className="text-left">
            <h3 className="text-sm font-bold">Pausa de 3 Minutos</h3>
            <p className="text-[11px] text-amber-600">Urge Surfing - clique quando a vontade vier</p>
          </div>
        </div>
        {pauseCount > 0 && (
          <span className="text-xs font-bold text-amber-600 bg-amber-100 px-2 py-1 rounded-lg">
            {pauseCount} hoje
          </span>
        )}
      </button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 w-full max-w-sm space-y-5 shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-slate-800">Pausa de 3 Minutos</h2>
          <button
            onClick={() => { cancelarPausa(); setAberto(false) }}
            className="p-1 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {!rodando && !concluido && (
          <div className="text-center space-y-4">
            <p className="text-sm text-slate-600 leading-relaxed">
              Quando a vontade de comer por emocao vier, pare por 3 minutos.
              Respire comigo e deixe a onda passar.
            </p>
            <button
              onClick={iniciarPausa}
              className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-2xl transition-all active:scale-95"
            >
              Comecar Pausa
            </button>
          </div>
        )}

        {rodando && (
          <div className="text-center space-y-4">
            <div className="relative w-32 h-32 mx-auto">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="54" fill="none" stroke="#f1f5f9" strokeWidth="8" />
                <circle
                  cx="60" cy="60" r="54" fill="none"
                  stroke="url(#pauseGradient)" strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={circunferencia}
                  strokeDashoffset={offset}
                  className="transition-all duration-1000"
                />
                <defs>
                  <linearGradient id="pauseGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-slate-800">
                  {minutos}:{segundos.toString().padStart(2, '0')}
                </span>
              </div>
            </div>

            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${fase.cor} text-white font-bold text-sm`}>
              {fase.label}
            </div>

            <p className="text-sm text-slate-500 italic px-4 leading-relaxed">
              "{FRASES_ANCORAGEM[fraseIndex]}"
            </p>

            <button
              onClick={() => { cancelarPausa(); setAberto(false) }}
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              Cancelar
            </button>
          </div>
        )}

        {concluido && (
          <div className="text-center space-y-3">
            <div className="text-4xl">✨</div>
            <h3 className="font-bold text-slate-800">Pausa Concluida!</h3>
            <p className="text-sm text-slate-600">
              Voce resistiu. Cada pausa e uma vitoria sobre os impulsos.
            </p>
            <p className="text-xs text-slate-400">
              {pauseCount + 1} pausa{pauseCount + 1 > 1 ? 's' : ''} hoje
            </p>
            <button
              onClick={() => setAberto(false)}
              className="w-full py-3 bg-slate-900 text-white font-bold rounded-2xl text-sm"
            >
              Fechar
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
