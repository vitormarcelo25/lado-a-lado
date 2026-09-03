import { Sparkles, Check, RefreshCw, Zap } from 'lucide-react'
import { useDailyMission } from '../hooks/useDailyMission'

export default function DailyMission({ streak = 0, humor = 'bem', agua = 0, alimentacao = false }) {
  const {
    mission,
    dica,
    isAi,
    loading,
    gerando,
    toggleConcluida,
    gerarNovaMissaoIA
  } = useDailyMission({ streak, humor, agua, alimentacao })

  if (loading) {
    return (
      <div className="w-full p-4 rounded-2xl border border-violet-100 bg-violet-50/40 animate-pulse flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-200/60 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-violet-400" />
          </div>
          <div className="space-y-1.5">
            <div className="h-2.5 w-24 bg-violet-200/60 rounded"></div>
            <div className="h-3.5 w-48 bg-violet-200/80 rounded"></div>
          </div>
        </div>
        <div className="w-6 h-6 rounded-full bg-violet-200/50"></div>
      </div>
    )
  }

  if (!mission) return null

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border transition-all duration-300 ${
        mission.concluida
          ? 'bg-gradient-to-r from-emerald-50/90 to-teal-50/90 border-emerald-200 shadow-sm'
          : 'bg-gradient-to-r from-violet-50/90 via-fuchsia-50/40 to-purple-50/90 border-violet-200/80 shadow-sm hover:shadow-md'
      }`}
    >
      <div className="p-4 space-y-2.5">
        {/* Header da Missão com Badge IA e Botão de Trocar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-violet-100 text-violet-700 border border-violet-200">
              <Sparkles className="w-3 h-3 text-violet-500" />
              {isAi ? 'Missão do Dia • IA' : 'Missão do Dia'}
            </span>
            {mission.concluida && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700 border border-emerald-200">
                Concluída ✨
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={gerarNovaMissaoIA}
            disabled={gerando}
            title="Gerar outra sugestão com IA"
            className="p-1.5 text-slate-400 hover:text-violet-600 hover:bg-white/80 active:scale-95 rounded-lg transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${gerando ? 'animate-spin text-violet-500' : ''}`} />
          </button>
        </div>

        {/* Conteúdo da Missão clicável para concluir */}
        <div
          onClick={toggleConcluida}
          className="flex items-start justify-between gap-3 cursor-pointer group"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              toggleConcluida()
            }
          }}
        >
          <div className="flex items-start gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                mission.concluida
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200'
                  : 'bg-violet-600 text-white shadow-md shadow-violet-200 group-hover:scale-105'
              }`}
            >
              {mission.concluida ? <Check className="w-5 h-5" /> : <Zap className="w-5 h-5" />}
            </div>

            <div className="space-y-0.5 text-left">
              <h3
                className={`text-sm font-semibold leading-snug transition-colors ${
                  mission.concluida ? 'line-through text-slate-400' : 'text-slate-800'
                }`}
              >
                {mission.missao}
              </h3>

              {dica && !mission.concluida && (
                <p className="text-[11px] text-violet-600/90 font-medium leading-tight">
                  💡 {dica}
                </p>
              )}

              {mission.concluida && (
                <p className="text-[11px] text-emerald-600 font-medium">
                  Excelente! Constância nos pequenos passos.
                </p>
              )}
            </div>
          </div>

          <div
            className={`w-7 h-7 rounded-xl border flex items-center justify-center shrink-0 transition-all ${
              mission.concluida
                ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm'
                : 'border-slate-300 bg-white group-hover:border-violet-400'
            }`}
          >
            <Check className={`w-4 h-4 ${mission.concluida ? 'opacity-100' : 'opacity-0'}`} />
          </div>
        </div>
      </div>
    </div>
  )
}
