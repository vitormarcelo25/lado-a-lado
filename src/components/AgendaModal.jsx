import { useState } from 'react'
import {
  X, Plus, Calendar, Clock, CheckCircle2, Circle,
  Trash2, Volume2, Bell, AlertCircle, Sparkles
} from 'lucide-react'
import { CATEGORIAS } from '../hooks/useAgenda'
import { previewAlarmSound } from '../utils/alarmSound'

function getHojeISO() {
  const d = new Date()
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getHoraSugerida() {
  const d = new Date()
  d.setMinutes(d.getMinutes() + 15) // sugere 15 min à frente
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

function formatarDataAmigavel(dataStr) {
  const hoje = getHojeISO()
  const d = new Date()
  d.setDate(d.getDate() + 1)
  const ano = d.getFullYear()
  const mes = String(d.getMonth() + 1).padStart(2, '0')
  const dia = String(d.getDate()).padStart(2, '0')
  const amanha = `${ano}-${mes}-${dia}`

  if (dataStr === hoje) return 'Hoje'
  if (dataStr === amanha) return 'Amanhã'

  const [y, m, dayNum] = dataStr.split('-')
  return `${dayNum}/${m}`
}

export default function AgendaModal({
  isOpen,
  onClose,
  itens,
  onAdicionar,
  onRemover,
  onAlternarConcluido
}) {
  const [novoAberto, setNovoAberto] = useState(false)
  const [titulo, setTitulo] = useState('')
  const [data, setData] = useState(getHojeISO())
  const [horario, setHorario] = useState(getHoraSugerida())
  const [categoria, setCategoria] = useState('geral')
  const [observacao, setObservacao] = useState('')
  const [abaAtiva, setAbaAtiva] = useState('pendentes') // 'pendentes' | 'concluidos'

  if (!isOpen) return null

  const handleSalvar = (e) => {
    e.preventDefault()
    if (!titulo.trim() || !data || !horario) return

    onAdicionar({
      titulo,
      data,
      horario,
      categoria,
      observacao
    })

    // Reset form
    setTitulo('')
    setObservacao('')
    setNovoAberto(false)
  }

  const pendentes = itens.filter(i => !i.concluido)
  const concluidos = itens.filter(i => i.concluido)
  const itensExibidos = abaAtiva === 'pendentes' ? pendentes : concluidos

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 space-y-4 shadow-2xl max-h-[92vh] flex flex-col">
        
        {/* Cabeçalho */}
        <div className="flex items-center justify-between pb-1 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base text-slate-900">Agenda & Alarmes</h2>
              <p className="text-[11px] text-slate-400">Lembretes sonoros para o seu dia</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => previewAlarmSound()}
              className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Testar o toque do alarme"
            >
              <Volume2 className="w-3.5 h-3.5 text-rose-500" />
              <span>Ouvir Som</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Botão para Novo Agendamento */}
        {!novoAberto ? (
          <button
            onClick={() => setNovoAberto(true)}
            className="w-full py-3 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-sm shadow-rose-200 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Lembrete com Alarme</span>
          </button>
        ) : (
          /* Formulário de Criação */
          <form onSubmit={handleSalvar} className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-3 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Agendar Atividade</span>
              <button
                type="button"
                onClick={() => setNovoAberto(false)}
                className="text-xs text-slate-400 hover:text-slate-600"
              >
                Cancelar
              </button>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-500 block mb-1">O que você precisa fazer?</label>
              <input
                type="text"
                placeholder="Ex: Tomar remédio, Lanche proteico, Água..."
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                required
                className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-rose-400 font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1">Dia</label>
                <input
                  type="date"
                  value={data}
                  onChange={(e) => setData(e.target.value)}
                  required
                  className="w-full px-2.5 py-1.5 bg-white rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-rose-400"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1">Horário (Alarme)</label>
                <input
                  type="time"
                  value={horario}
                  onChange={(e) => setHorario(e.target.value)}
                  required
                  className="w-full px-2.5 py-1.5 bg-white rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-rose-400 font-bold"
                />
              </div>
            </div>

            {/* Categorias */}
            <div>
              <label className="text-[11px] font-semibold text-slate-500 block mb-1.5">Categoria</label>
              <div className="flex flex-wrap gap-1.5">
                {CATEGORIAS.map(cat => (
                  <button
                    type="button"
                    key={cat.id}
                    onClick={() => setCategoria(cat.id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                      categoria === cat.id
                        ? 'bg-rose-500 text-white font-bold shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-500 block mb-1">Observação (opcional)</label>
              <input
                type="text"
                placeholder="Ex: Não esquecer de tomar com bastante água"
                value={observacao}
                onChange={(e) => setObservacao(e.target.value)}
                className="w-full px-3 py-1.5 bg-white rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-rose-400"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Salvar e Ativar Alarme</span>
            </button>
          </form>
        )}

        {/* Abas de Navegação */}
        <div className="flex items-center border-b border-slate-100 gap-4 pt-1">
          <button
            onClick={() => setAbaAtiva('pendentes')}
            className={`pb-2 text-xs font-bold transition-all relative ${
              abaAtiva === 'pendentes' ? 'text-rose-600' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            Lembretes Ativos ({pendentes.length})
            {abaAtiva === 'pendentes' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-rose-500 rounded-full" />
            )}
          </button>
          <button
            onClick={() => setAbaAtiva('concluidos')}
            className={`pb-2 text-xs font-bold transition-all relative ${
              abaAtiva === 'concluidos' ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            Concluídos ({concluidos.length})
            {abaAtiva === 'concluidos' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-full" />
            )}
          </button>
        </div>

        {/* Lista de Itens */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 min-h-[160px] max-h-[360px]">
          {itensExibidos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center text-slate-400 space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300">
                <Sparkles className="w-6 h-6" />
              </div>
              <p className="text-xs font-medium">
                {abaAtiva === 'pendentes'
                  ? 'Nenhum lembrete agendado. Toque acima para agendar!'
                  : 'Nenhum lembrete concluído ainda.'}
              </p>
            </div>
          ) : (
            itensExibidos.map(item => {
              const cat = CATEGORIAS.find(c => c.id === item.categoria) || CATEGORIAS[0]
              const dataAmigavel = formatarDataAmigavel(item.data)

              return (
                <div
                  key={item.id}
                  className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                    item.concluido
                      ? 'bg-slate-50 border-slate-100 opacity-70'
                      : 'bg-white border-slate-200/70 shadow-xs hover:border-rose-200'
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <button
                      onClick={() => onAlternarConcluido(item.id)}
                      className="text-slate-300 hover:text-emerald-500 transition-colors shrink-0 cursor-pointer"
                      title={item.concluido ? 'Desmarcar como concluído' : 'Marcar como concluído'}
                    >
                      {item.concluido ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </button>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-xs font-bold leading-none ${item.concluido ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                          {item.titulo}
                        </span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${cat.cor}`}>
                          {cat.label}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                        <span className="flex items-center gap-1 font-semibold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded-md">
                          <Clock className="w-3 h-3" />
                          {dataAmigavel} às {item.horario}
                        </span>
                        {item.observacao && (
                          <span className="truncate max-w-[140px] text-slate-500">
                            • {item.observacao}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onRemover(item.id)}
                    className="p-1.5 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-colors shrink-0 cursor-pointer"
                    title="Excluir lembrete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )
            })
          )}
        </div>

        {/* Dica do Alarme */}
        <div className="pt-2 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-400">
          <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
          <span>O alarme tocará um bip sonoro contínuo e vibrará no horário exato configurado.</span>
        </div>

      </div>
    </div>
  )
}
