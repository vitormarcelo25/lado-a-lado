import { useState, useEffect } from 'react'
import {
  Droplets, Sparkles, Shield, HelpCircle, Bell,
  MessageCircleHeart, CheckCircle2, Target, LineChart,
  Plus, Minus, Smile, Meh, Frown, PartyPopper
} from 'lucide-react'
import { useCheckins } from '../hooks/useCheckins'
import { useStreak } from '../hooks/useStreak'
import { useQuotes } from '../hooks/useQuotes'
import { useWeightLogs } from '../hooks/useWeightLogs'
import { useNotifications } from '../hooks/useNotifications'
import QuoteCard from '../components/QuoteCard'
import StreakCounter from '../components/StreakCounter'
import WeightModal from '../components/WeightModal'
import SosModal from '../components/SosModal'
import GuiaModal from '../components/GuiaModal'
import MounjaroCard from '../components/MounjaroCard'
import SideEffectsChecklist from '../components/SideEffectsChecklist'
import PauseButton from '../components/PauseButton'
import HungerThermometer from '../components/HungerThermometer'
import ProteinFiberChecklist from '../components/ProteinFiberChecklist'
import NonScaleVictories from '../components/NonScaleVictories'
import DailyMission from '../components/DailyMission'
import HistoryDashboardModal from '../components/HistoryDashboardModal'

const META_COPAS = 10

const HUMORES = [
  { id: 'otimo', icone: PartyPopper, label: 'Radiante' },
  { id: 'bem', icone: Smile, label: 'Firme' },
  { id: 'arrastado', icone: Meh, label: 'Cansada' },
  { id: 'dificil', icone: Frown, label: 'Dificil' },
]

export default function UserView({ onGuardiao }) {
  const { checkin, loading, toggle, setValue, setHumor } = useCheckins()
  const { streak } = useStreak()
  const { quote, isAiGenerated } = useQuotes({ streak, humor: checkin?.humor })
  const { logs, latest, addLog } = useWeightLogs()
  const { suportado, permissao, solicitarPermissao, agendarVerificacoes } = useNotifications()

  const [weightOpen, setWeightOpen] = useState(false)
  const [sosOpen, setSosOpen] = useState(false)
  const [guiaAberto, setGuiaAberto] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)

  useEffect(() => {
    if (permissao === 'granted') {
      agendarVerificacoes()
    }
  }, [permissao, agendarVerificacoes])

  const alimentacao = checkin?.alimentacao ?? false
  const coposAgua = checkin?.agua ?? 0
  const humorSelecionado = checkin?.humor ?? 'bem'

  const calcularProgresso = () => {
    let p = 0
    if (alimentacao) p += 50
    p += Math.min(50, Math.round((coposAgua / META_COPAS) * 50))
    return p
  }

  const atualizarAgua = (delta) => {
    const novo = Math.max(0, Math.min(META_COPAS, coposAgua + delta))
    setValue('agua', novo)
  }

  if (loading) {
    return (
      <div className="max-w-md mx-auto min-h-screen flex items-center justify-center">
        <div className="text-slate-400 text-sm">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2.5">
          <img src="/icon-192.png" alt="Lado a Lado" className="w-10 h-10 rounded-2xl shadow-md shadow-rose-200" />
          <div>
            <h1 className="font-bold text-base text-slate-900 leading-tight">Lado a Lado</h1>
            <p className="text-[11px] text-slate-500 font-medium">Seu espaco de recomeco</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {suportado && permissao !== 'granted' && (
            <button
              onClick={solicitarPermissao}
              className="w-8 h-8 rounded-full flex items-center justify-center text-amber-500 hover:bg-amber-50 transition-colors"
              title="Ativar lembretes"
            >
              <Bell className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => setGuiaAberto(true)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            title="Como usar o app"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
          <button
            onClick={() => setWeightOpen(true)}
            className="flex items-center gap-1.5 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-full text-xs font-bold text-rose-700 hover:bg-rose-100 transition-colors"
          >
            <Target className="w-3.5 h-3.5 text-rose-500" />
            <span>Registrar Peso</span>
          </button>
          <button
            onClick={() => setHistoryOpen(true)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            title="Historico e Relatorios"
          >
            <LineChart className="w-4 h-4" />
          </button>
          <button
            onClick={onGuardiao}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-300 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <Shield className="w-4 h-4" />
          </button>
        </div>
      </header>

      <QuoteCard quote={quote} isAiGenerated={isAiGenerated} />

      <StreakCounter streak={streak} />

      <MounjaroCard />

      <section className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-3">
        <div className="flex justify-between items-end">
          <div>
            <span className="text-[11px] font-bold tracking-wider text-rose-500 uppercase">Resumo de Hoje</span>
            <h2 className="text-xl font-black text-slate-800">{calcularProgresso()}% Concluido</h2>
          </div>
        </div>
        <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden p-0.5">
          <div
            className="bg-gradient-to-r from-rose-500 to-pink-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${calcularProgresso()}%` }}
          />
        </div>
      </section>

      <section className="space-y-2">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Como voce esta?</span>
        <div className="grid grid-cols-4 gap-2">
          {HUMORES.map((h) => {
            const Icone = h.icone
            const sel = humorSelecionado === h.id
            return (
              <button
                key={h.id}
                onClick={() => setHumor(h.id)}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all ${
                  sel ? 'border-rose-400 bg-rose-50/60 shadow-xs' : 'border-slate-100 bg-white text-slate-500'
                }`}
              >
                <Icone className={`w-5 h-5 mb-1 ${sel ? 'text-rose-600' : 'text-slate-400'}`} />
                <span className={`text-[11px] font-semibold ${sel ? 'text-rose-900' : 'text-slate-600'}`}>{h.label}</span>
              </button>
            )
          })}
        </div>
      </section>

      <PauseButton />

      <HungerThermometer />

      <SideEffectsChecklist />

      <ProteinFiberChecklist />

      <DailyMission
        streak={streak}
        humor={checkin?.humor}
        agua={coposAgua}
        alimentacao={alimentacao}
      />

      <section className="space-y-2.5">
        <div
          onClick={() => toggle('alimentacao')}
          className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
            alimentacao ? 'bg-emerald-50/80 border-emerald-300' : 'bg-white border-slate-100'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${alimentacao ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Alimentacao no plano</h3>
              <p className="text-[11px] text-slate-500">Comida limpa e balanceada</p>
            </div>
          </div>
          <CheckCircle2 className={`w-6 h-6 ${alimentacao ? 'text-emerald-600' : 'text-slate-200'}`} />
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs space-y-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center">
                <Droplets className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">Hidratacao</h3>
                <p className="text-[11px] text-slate-500">{coposAgua * 250}ml de {(META_COPAS * 250) / 1000}L batidos</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={(e) => { e.stopPropagation(); atualizarAgua(-1) }}
                className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="text-xs font-black text-slate-800 w-5 text-center">{coposAgua}</span>
              <button
                onClick={(e) => { e.stopPropagation(); atualizarAgua(1) }}
                className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center text-white"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      <NonScaleVictories />

      <footer className="pt-2 pb-4">
        <button
          onClick={() => setSosOpen(true)}
          className="flex items-center justify-center gap-2.5 w-full py-4 bg-slate-900 text-white font-bold text-sm rounded-2xl shadow-lg shadow-slate-300 transition-all active:scale-[0.98]"
        >
          <MessageCircleHeart className="w-5 h-5 text-rose-400" />
          Tive uma recaida / Preciso de apoio
        </button>
      </footer>

      <WeightModal
        isOpen={weightOpen}
        onClose={() => setWeightOpen(false)}
        onSave={addLog}
        latest={latest}
      />

      <SosModal isOpen={sosOpen} onClose={() => setSosOpen(false)} />

      <GuiaModal aberto={guiaAberto} fechar={() => setGuiaAberto(false)} />

      <HistoryDashboardModal isOpen={historyOpen} onClose={() => setHistoryOpen(false)} weightLogs={logs} />
    </div>
  )
}
