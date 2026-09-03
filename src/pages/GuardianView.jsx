import { useState, useEffect } from 'react'
import { Shield, AlertTriangle, Clock } from 'lucide-react'
import { getAllCheckinsForDate, getWeightLogs } from '../services/supabase'
import WeightChart from '../components/WeightChart'
import GuardianActions from '../components/GuardianActions'

function StatusBadge({ label, value }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
      <span className="text-sm text-slate-600">{label}</span>
      <span className={`text-sm font-bold ${value ? 'text-emerald-600' : 'text-slate-400'}`}>
        {value ? 'Sim' : 'Nao'}
      </span>
    </div>
  )
}

export default function GuardianView() {
  const [todayData, setTodayData] = useState(null)
  const [weightLogs, setWeightLogs] = useState([])
  const [inactive, setInactive] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const today = new Date().toISOString().slice(0, 10)
        const [checkins, weights] = await Promise.all([
          getAllCheckinsForDate(today),
          getWeightLogs(),
        ])

        setTodayData(checkins)
        setWeightLogs(weights)

        if (checkins?.created_at) {
          const lastInteraction = new Date(checkins.created_at)
          const hoursAgo = (Date.now() - lastInteraction.getTime()) / (1000 * 60 * 60)
          setInactive(hoursAgo > 24)
        } else {
          setInactive(true)
        }
      } catch (err) {
        console.error('Erro ao buscar dados do guardiao:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="max-w-md mx-auto min-h-screen flex items-center justify-center">
        <div className="text-slate-400 text-sm">Carregando...</div>
      </div>
    )
  }

  return (
    <main className="max-w-md mx-auto min-h-screen p-5 space-y-6">
      <header className="flex items-center gap-3 pt-2">
        <Shield className="w-7 h-7 text-slate-700" />
        <div>
          <h1 className="font-bold text-lg text-slate-800">Painel do Guardiao</h1>
          <p className="text-xs text-slate-500">Acompanhamento de hoje</p>
        </div>
      </header>

      {inactive && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
          <p className="text-sm text-red-700 font-medium">
            Nenhuma interacao nas ultimas 24 horas.
          </p>
        </div>
      )}

      <section className="bg-white rounded-xl border border-slate-200 p-4">
        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">
          Status de Hoje
        </h2>
        <StatusBadge label="Medicacao tomada" value={todayData?.tomou_remedio} />
        <StatusBadge label="Agua batida" value={todayData?.bebeu_agua} />
        <StatusBadge label="Alimentacao ok" value={todayData?.refeicoes_ok} />

        {todayData?.humor && (
          <div className="flex items-center justify-between py-3">
            <span className="text-sm text-slate-600">Humor</span>
            <span className="text-sm font-bold text-slate-700 capitalize">{todayData.humor}</span>
          </div>
        )}

        {!todayData && (
          <div className="flex items-center gap-2 py-3 text-slate-400">
            <Clock className="w-4 h-4" />
            <span className="text-sm">Nenhum check-in registrado hoje.</span>
          </div>
        )}
      </section>

      <GuardianActions />

      <WeightChart logs={weightLogs} />
    </main>
  )
}
