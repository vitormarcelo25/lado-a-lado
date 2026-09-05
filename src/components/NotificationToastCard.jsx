import { BellRing, Check, Clock, X } from 'lucide-react'
import { CATEGORIAS } from '../hooks/useAgenda'

export default function NotificationToastCard({
  alarme,
  onConcluir,
  onAdiar,
  onDispensar
}) {
  if (!alarme) return null

  const cat = CATEGORIAS.find(c => c.id === alarme.categoria) || CATEGORIAS[0]

  return (
    <div className="fixed top-3 left-1/2 -translate-x-1/2 w-[92%] max-w-md z-[110] animate-in slide-in-from-top-6 duration-300">
      <div className="bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-2xl border-2 border-rose-400/80 shadow-rose-200/50 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 to-pink-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-rose-300 animate-bounce">
              <BellRing className="w-5 h-5" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-black uppercase tracking-wider bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full">
                  ⏰ Lembrete no Horário • {alarme.horario}
                </span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${cat.cor}`}>
                  {cat.label}
                </span>
              </div>

              <h4 className="text-sm font-black text-slate-800 mt-1 leading-snug">
                {alarme.titulo}
              </h4>

              {alarme.observacao && (
                <p className="text-xs text-slate-500 mt-0.5 truncate">
                  {alarme.observacao}
                </p>
              )}
            </div>
          </div>

          <button
            onClick={onDispensar}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors shrink-0"
            title="Fechar card"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Botões de Ação no Card */}
        <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
          <button
            onClick={onConcluir}
            className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Feito! Concluir</span>
          </button>

          <button
            onClick={() => onAdiar(5)}
            className="py-2 px-3 bg-amber-50 hover:bg-amber-100 active:scale-[0.98] text-amber-800 font-bold rounded-xl text-xs flex items-center justify-center gap-1 border border-amber-200 transition-all cursor-pointer"
          >
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Adiar 5m</span>
          </button>
        </div>
      </div>
    </div>
  )
}
