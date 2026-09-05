import { CalendarDays, Clock, Plus, CheckCircle2, Circle, ChevronRight } from 'lucide-react'
import { CATEGORIAS } from '../hooks/useAgenda'

function getHojeISO() {
  const d = new Date()
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export default function TodayAgendaCard({ itens, onAbrirAgenda, onAlternarConcluido }) {
  const hoje = getHojeISO()
  const itensHoje = itens.filter(i => i.data === hoje)
  const pendentesHoje = itensHoje.filter(i => !i.concluido)

  return (
    <section className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-3.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <CalendarDays className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-800">Sua Agenda de Hoje</h2>
            <p className="text-[11px] text-slate-400">
              {itensHoje.length === 0
                ? 'Nenhuma tarefa agendada'
                : `${pendentesHoje.length} pendente${pendentesHoje.length === 1 ? '' : 's'}`}
            </p>
          </div>
        </div>

        <button
          onClick={onAbrirAgenda}
          className="flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-2.5 py-1.5 rounded-xl transition-colors cursor-pointer"
        >
          <span>Ver tudo</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {itensHoje.length === 0 ? (
        <button
          onClick={onAbrirAgenda}
          className="w-full py-3.5 px-4 rounded-2xl border border-dashed border-slate-200 hover:border-rose-300 bg-slate-50/60 hover:bg-rose-50/30 text-slate-500 hover:text-rose-600 flex items-center justify-center gap-2 text-xs font-medium transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 text-rose-500" />
          <span>Agendar lembrete com alarme para hoje</span>
        </button>
      ) : (
        <div className="space-y-2">
          {itensHoje.slice(0, 3).map(item => {
            const cat = CATEGORIAS.find(c => c.id === item.categoria) || CATEGORIAS[0]
            return (
              <div
                key={item.id}
                className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                  item.concluido
                    ? 'bg-slate-50 border-slate-100 opacity-60'
                    : 'bg-white border-slate-100 shadow-2xs hover:border-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <button
                    onClick={() => onAlternarConcluido(item.id)}
                    className="text-slate-300 hover:text-emerald-500 transition-colors shrink-0 cursor-pointer"
                  >
                    {item.concluido ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Circle className="w-4 h-4" />
                    )}
                  </button>
                  <div className="min-w-0 flex-1">
                    <p className={`text-xs font-bold truncate ${item.concluido ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                      {item.titulo}
                    </p>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                      <span className="flex items-center gap-0.5 font-semibold text-rose-600">
                        <Clock className="w-2.5 h-2.5" />
                        {item.horario}
                      </span>
                      <span className={`px-1 py-0.2 rounded ${cat.cor}`}>
                        {cat.label}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}

          {itensHoje.length > 3 && (
            <p className="text-[11px] text-center text-slate-400 font-medium pt-1">
              +{itensHoje.length - 3} outro(s) lembrete(s) hoje
            </p>
          )}
        </div>
      )}
    </section>
  )
}
