import { BellRing, Check, Clock, VolumeX } from 'lucide-react'
import { CATEGORIAS } from '../hooks/useAgenda'

export default function AlarmOverlay({ alarme, onParar, onConcluir, onAdiar }) {
  if (!alarme) return null

  const cat = CATEGORIAS.find(c => c.id === alarme.categoria) || CATEGORIAS[0]

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-rose-200 text-center space-y-6 animate-in zoom-in-95 duration-200">
        
        {/* Ícone pulsante de alarme */}
        <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-rose-400/30 animate-ping" />
          <div className="relative w-20 h-20 rounded-full bg-gradient-to-tr from-rose-500 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-rose-300">
            <BellRing className="w-10 h-10 animate-bounce" />
          </div>
        </div>

        {/* Informações do Lembrete */}
        <div className="space-y-2">
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold tracking-wide ${cat.cor}`}>
            {cat.label} • {alarme.horario}
          </span>
          <h2 className="text-2xl font-black text-slate-800 leading-snug">
            {alarme.titulo}
          </h2>
          {alarme.observacao && (
            <p className="text-sm text-slate-500 bg-slate-50 p-3 rounded-2xl border border-slate-100">
              {alarme.observacao}
            </p>
          )}
        </div>

        {/* Botões de Ação */}
        <div className="space-y-2.5 pt-2">
          <button
            onClick={onConcluir}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold rounded-2xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-200 transition-all cursor-pointer"
          >
            <Check className="w-5 h-5" />
            <span>Feito! Concluir e Parar Alarme</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onAdiar(5)}
              className="py-3 bg-amber-50 hover:bg-amber-100 active:scale-[0.98] text-amber-800 font-semibold rounded-2xl text-xs flex items-center justify-center gap-1.5 border border-amber-200 transition-all cursor-pointer"
            >
              <Clock className="w-4 h-4 text-amber-600" />
              <span>Adiar 5 min</span>
            </button>

            <button
              onClick={onParar}
              className="py-3 bg-slate-100 hover:bg-slate-200 active:scale-[0.98] text-slate-700 font-semibold rounded-2xl text-xs flex items-center justify-center gap-1.5 border border-slate-200 transition-all cursor-pointer"
            >
              <VolumeX className="w-4 h-4 text-slate-500" />
              <span>Parar Alarme</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
