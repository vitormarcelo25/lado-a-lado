import { useState, useEffect } from 'react'
import { X, LineChart, Activity, Sparkles, RefreshCw, Loader2 } from 'lucide-react'
import WeightChart from './WeightChart'
import { getMetas, getAllCheckinsForDate, getCurrentWeekVictories } from '../services/supabase'
import { callGemini } from '../services/gemini'

export default function HistoryDashboardModal({ isOpen, onClose, weightLogs }) {
  const [metas, setMetas] = useState(null)
  const [hojeDados, setHojeDados] = useState(null)
  const [victories, setVictories] = useState(null)
  
  const [weeklySummary, setWeeklySummary] = useState(null)
  const [loadingWeeklySummary, setLoadingWeeklySummary] = useState(false)

  useEffect(() => {
    if (!isOpen) return

    async function fetchData() {
      const hoje = new Date().toISOString().slice(0, 10)
      try {
        const [dMetas, dCheckin, dVictories] = await Promise.all([
          getMetas(),
          getAllCheckinsForDate(hoje),
          getCurrentWeekVictories()
        ])
        setMetas(dMetas)
        setHojeDados(dCheckin)
        setVictories(dVictories)
      } catch (err) {
        console.error('Erro ao buscar dados do dashboard:', err)
      }
    }
    
    fetchData()
  }, [isOpen])

  const gerarResumoSemanalIA = async () => {
    setLoadingWeeklySummary(true)
    try {
      const res = await callGemini('weekly_summary', {
        streak: weightLogs?.length || 1,
        checkinsCount: hojeDados ? 1 : 0,
        pesoInicial: metas?.peso_inicial || 0,
        pesoAtual: metas?.peso_atual || 0,
        vitorias: victories ? Object.keys(victories).filter(k => victories[k] && k !== 'id' && k !== 'created_at' && k !== 'user_id') : []
      })
      if (res?.destaque_positivo) {
        setWeeklySummary(res)
      }
    } catch (err) {
      console.error('Erro ao gerar resumo semanal com IA:', err)
    } finally {
      setLoadingWeeklySummary(false)
    }
  }

  if (!isOpen) return null

  const pesoPerdido = metas?.peso_inicial > 0 && metas?.peso_atual > 0
    ? (metas.peso_inicial - metas.peso_atual).toFixed(1)
    : null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full h-[90vh] sm:h-auto sm:max-h-[90vh] sm:max-w-md sm:rounded-3xl rounded-t-3xl flex flex-col animate-in slide-in-from-bottom">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <LineChart className="w-5 h-5 text-rose-500" />
            <h2 className="text-lg font-bold text-slate-800">Historico & Relatorios</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Evolucao do Tratamento */}
          {metas && (
            <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm space-y-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-emerald-500" />
                Evolucao do Tratamento
              </span>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-3 bg-slate-50 rounded-2xl">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Inicial</span>
                  <span className="text-sm font-black text-slate-700">{metas.peso_inicial || 0} kg</span>
                </div>
                <div className="p-3 bg-rose-50 rounded-2xl border border-rose-100">
                  <span className="text-[10px] font-bold text-rose-500 uppercase block">Atual</span>
                  <span className="text-sm font-black text-rose-700">{metas.peso_atual || 0} kg</span>
                </div>
                <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100">
                  <span className="text-[10px] font-bold text-emerald-600 uppercase block">Meta</span>
                  <span className="text-sm font-black text-emerald-700">{metas.peso_meta || 0} kg</span>
                </div>
              </div>
              {pesoPerdido && (
                <p className="text-xs text-center font-semibold text-slate-600 pt-1">
                  Progresso: <span className="text-emerald-600 font-bold">
                    {pesoPerdido > 0 ? `-${pesoPerdido} kg eliminados` : 'Iniciando'}
                  </span>
                </p>
              )}
            </div>
          )}

          {/* Grafico */}
          <WeightChart logs={weightLogs} />

          {/* Insights com IA */}
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950 p-5 rounded-3xl text-white shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-violet-500/20 text-violet-300 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-violet-200">Insights da Semana</h3>
                  <p className="text-[11px] text-slate-400">Análise empática com Gemini IA</p>
                </div>
              </div>
              <button
                onClick={gerarResumoSemanalIA}
                disabled={loadingWeeklySummary}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
              >
                {loadingWeeklySummary ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Gerando...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>{weeklySummary ? 'Atualizar' : 'Gerar Análise'}</span>
                  </>
                )}
              </button>
            </div>

            {weeklySummary ? (
              <div className="space-y-2.5 pt-2 border-t border-white/10 text-xs">
                <div className="bg-white/5 p-3 rounded-2xl border border-white/10 space-y-1">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">🌟 Pontos Fortes</span>
                  <p className="text-slate-200 leading-relaxed">{weeklySummary.destaque_positivo}</p>
                </div>

                <div className="bg-white/5 p-3 rounded-2xl border border-white/10 space-y-1">
                  <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider block">💛 Atenção Amorosa</span>
                  <p className="text-slate-200 leading-relaxed">{weeklySummary.atencao_amorosa}</p>
                </div>

                <div className="bg-white/5 p-3 rounded-2xl border border-white/10 space-y-1">
                  <span className="text-[10px] font-bold text-violet-300 uppercase tracking-wider block">💡 Dica Prática</span>
                  <p className="text-slate-200 leading-relaxed">{weeklySummary.dica_para_guardiao}</p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 pt-1">
                Gere um resumo inteligente do seu progresso, baseado nas suas vitórias, check-ins e evolução de peso.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
