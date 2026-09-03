import { useState } from 'react'
import { HeartHandshake, Pill, Droplet, Salad, Scale, MessageCircleHeart } from 'lucide-react'
import { useCheckins } from '../hooks/useCheckins'
import { useStreak } from '../hooks/useStreak'
import { useQuotes } from '../hooks/useQuotes'
import { useWeightLogs } from '../hooks/useWeightLogs'
import CheckinCard from '../components/CheckinCard'
import StreakCounter from '../components/StreakCounter'
import QuoteCard from '../components/QuoteCard'
import WeightModal from '../components/WeightModal'
import SosModal from '../components/SosModal'

export default function UserView() {
  const { checkin, loading, toggle } = useCheckins()
  const { streak } = useStreak()
  const quote = useQuotes()
  const { latest, addLog } = useWeightLogs()

  const [weightOpen, setWeightOpen] = useState(false)
  const [sosOpen, setSosOpen] = useState(false)

  if (loading) {
    return (
      <div className="max-w-md mx-auto min-h-screen flex items-center justify-center">
        <div className="text-slate-400 text-sm">Carregando...</div>
      </div>
    )
  }

  return (
    <main className="max-w-md mx-auto min-h-screen flex flex-col justify-between p-5 pb-8">
      <section className="space-y-4">
        <header className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <HeartHandshake className="w-7 h-7 text-rose-500" />
            <span className="font-bold text-lg text-slate-800 tracking-tight">Lado a Lado</span>
          </div>
          <span className="text-xs bg-rose-100 text-rose-700 font-semibold px-2.5 py-1 rounded-full">
            Dia a dia
          </span>
        </header>

        <QuoteCard quote={quote} />

        <StreakCounter streak={streak} />

        <div className="space-y-3 pt-2">
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
            Check-ins de Hoje
          </h2>

          <CheckinCard
            icon={Pill}
            label="Tomei a medicacao"
            active={checkin?.tomou_remedio}
            onToggle={() => toggle('tomou_remedio')}
          />

          <CheckinCard
            icon={Droplet}
            label="Bebi bastante agua"
            active={checkin?.bebeu_agua}
            onToggle={() => toggle('bebeu_agua')}
          />

          <CheckinCard
            icon={Salad}
            label="Segui as refeicoes planejadas"
            active={checkin?.refeicoes_ok}
            onToggle={() => toggle('refeicoes_ok')}
          />
        </div>

        <button
          onClick={() => setWeightOpen(true)}
          className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-all active:scale-[0.98]"
        >
          <div className="flex items-center gap-3">
            <Scale className="w-5 h-5 text-slate-400" />
            <div className="text-left">
              <span className="font-semibold text-sm block">Registrar Peso</span>
              {latest && (
                <span className="text-xs text-slate-400">
                  Ultimo: {latest.peso} kg em{' '}
                  {new Date(latest.data).toLocaleDateString('pt-BR')}
                </span>
              )}
            </div>
          </div>
          <span className="text-slate-300 text-lg">+</span>
        </button>
      </section>

      <footer className="mt-8">
        <button
          onClick={() => setSosOpen(true)}
          className="flex items-center justify-center gap-2 w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl shadow-md transition-all active:scale-[0.98]"
        >
          <MessageCircleHeart className="w-5 h-5 text-rose-400" />
          Tive uma recaida / Preciso de um gas
        </button>
      </footer>

      <WeightModal
        isOpen={weightOpen}
        onClose={() => setWeightOpen(false)}
        onSave={addLog}
        latest={latest}
      />

      <SosModal isOpen={sosOpen} onClose={() => setSosOpen(false)} />
    </main>
  )
}
