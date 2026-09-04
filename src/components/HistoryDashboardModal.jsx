import { useState, useEffect } from 'react'
import { X, LineChart, Activity, Sparkles, RefreshCw, Loader2, Settings, Calendar, Clock, Scale } from 'lucide-react'
import WeightChart from './WeightChart'
import GoalsModal from './GoalsModal'
import { getMetas, getAllCheckinsForDate, getCurrentWeekVictories, getWeightLogs } from '../services/supabase'
import { callGemini } from '../services/gemini'

export default function HistoryDashboardModal({ isOpen, onClose, weightLogs: initialLogs }) {
  const [metas, setMetas] = useState(null)
  const [hojeDados, setHojeDados] = useState(null)
  const [victories, setVictories] = useState(null)
  const [logs, setLogs] = useState(initialLogs || [])
  
  const [weeklySummary, setWeeklySummary] = useState(null)
  const [loadingWeeklySummary, setLoadingWeeklySummary] = useState(false)
  const [isGoalsOpen, setIsGoalsOpen] = useState(false)

  const fetchDadosDashboard = async () => {
    const hoje = new Date().toISOString().slice(0, 10)
    try {
      const [dMetas, dCheckin, dVictories, dLogs] = await Promise.all([
        getMetas(),
        getAllCheckinsForDate(hoje),
        getCurrentWeekVictories(),
        getWeightLogs()
      ])
      setMetas(dMetas)
      setHojeDados(dCheckin)
      setVictories(dVictories)
      if (dLogs) setLogs(dLogs)
    } catch (err) {
      console.error('Erro ao buscar dados do dashboard:', err)
    }
  }

  useEffect(() => {
    if (!isOpen) return
    fetchDadosDashboard()
  }, [isOpen])

  useEffect(() => {
    if (initialLogs && initialLogs.length > 0) {
      setLogs(initialLogs)
    }
  }, [initialLogs])

  const gerarResumoSemanalIA = async () => {
    setLoadingWeeklySummary(true)
    try {
      const res = await callGemini('weekly_summary', {
        streak: logs?.length || 1,
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
          <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm space-y-3 relative">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-emerald-500" />
                Evolução do Tratamento
              </span>
              <button 
                onClick={() => setIsGoalsOpen(true)}
                className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-400 transition-colors"
                title="Configurar Metas"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-3 bg-slate-50 rounded-2xl">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Inicial</span>
                <span className="text-sm font-black text-slate-700">{metas?.peso_inicial || 0} kg</span>
              </div>
              <div className="p-3 bg-rose-50 rounded-2xl border border-rose-100">
                <span className="text-[10px] font-bold text-rose-500 uppercase block">Atual</span>
                <span className="text-sm font-black text-rose-700">{metas?.peso_atual || 0} kg</span>
              </div>
              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100">
                <span className="text-[10px] font-bold text-emerald-600 uppercase block">Meta</span>
                <span className="text-sm font-black text-emerald-700">{metas?.peso_meta || 0} kg</span>
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

          {/* Grafico */}
          <WeightChart logs={logs} />

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

          {/* Timeline de Registros */}
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-sky-500" />
              Histórico de Registros
            </span>
            
            {logs && logs.length > 0 ? (
              <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                {/* Listando do mais recente para o mais antigo */}
                {[...logs].reverse().map((log, index) => {
                  const dataObj = log.created_at ? new Date(log.created_at) : new Date(log.data + 'T12:00:00Z');
                  const isFirst = index === 0;
                  return (
                    <div key={log.id || index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      {/* Timeline Dot */}
                      <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-slate-100 text-slate-500 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10">
                        {isFirst ? <Activity className="w-4 h-4 text-emerald-500" /> : <Scale className="w-4 h-4 text-slate-400" />}
                      </div>
                      
                      {/* Content Box */}
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl bg-slate-50 border border-slate-100 shadow-sm transition-all hover:shadow-md hover:bg-white hover:border-slate-200">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {dataObj.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} 
                            {log.created_at && ` às ${dataObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`}
                          </span>
                          <span className={`text-sm font-black ${isFirst ? 'text-rose-600' : 'text-slate-600'}`}>
                            {log.peso} kg
                          </span>
                        </div>
                        {log.cintura && (
                          <div className="text-[11px] text-slate-500 mt-1">Cintura: {log.cintura} cm</div>
                        )}
                        {log.nota && (
                          <div className="mt-2 p-2 bg-white rounded-xl text-xs text-slate-600 italic border border-slate-100">
                            "{log.nota}"
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center p-6 bg-slate-50 rounded-2xl">
                <p className="text-xs text-slate-400 font-medium">Nenhum peso registrado ainda. Registre para ver sua evolução.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <GoalsModal 
        isOpen={isGoalsOpen} 
        onClose={() => setIsGoalsOpen(false)} 
        onMetasUpdated={fetchDadosDashboard}
      />
    </div>
  )
}
