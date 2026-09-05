import { X, Bell, BellRing, CheckCircle2, Clock, Shield, Sparkles, Volume2 } from 'lucide-react'
import { CATEGORIAS } from '../hooks/useAgenda'
import { previewAlarmSound } from '../utils/alarmSound'

function getHojeISO() {
  const d = new Date()
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export default function NotificationsModal({
  isOpen,
  onClose,
  itensAgenda = [],
  permissao,
  onSolicitarPermissao,
  onTestarNotificacao,
  onAbrirAgenda,
  onAlternarConcluido
}) {
  if (!isOpen) return null

  const hoje = getHojeISO()
  const lembretesHoje = itensAgenda.filter(i => i.data === hoje)
  const pendentesHoje = lembretesHoje.filter(i => !i.concluido)
  const concluidosHoje = lembretesHoje.filter(i => i.concluido)

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 space-y-4 shadow-2xl max-h-[90vh] flex flex-col">
        
        {/* Cabeçalho */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base text-slate-900">Notificações</h2>
              <p className="text-[11px] text-slate-400">Cards e avisos dos seus lembretes</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status de Permissão de Notificações do Celular */}
        <div className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${
          permissao === 'granted'
            ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
            : 'bg-amber-50 border-amber-200 text-amber-900'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              permissao === 'granted' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
            }`}>
              <BellRing className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold">
                {permissao === 'granted' ? 'Avisos no celular ativos' : 'Ativar no celular'}
              </p>
              <p className="text-[10px] opacity-80">
                {permissao === 'granted'
                  ? 'Você recebe o card de alarme na barra de avisos'
                  : 'Toque para liberar o card de aviso na tela do celular'}
              </p>
            </div>
          </div>

          {permissao !== 'granted' ? (
            <button
              onClick={onSolicitarPermissao}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer shrink-0"
            >
              Ativar
            </button>
          ) : (
            <button
              onClick={onTestarNotificacao}
              className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-semibold text-[11px] rounded-xl transition-all cursor-pointer shrink-0"
            >
              Testar
            </button>
          )}
        </div>

        {/* Lista de Cards de Notificações */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 min-h-[220px]">
          
          {/* Seção: Cards Marcados para Hoje */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-rose-500" />
                Cards de Lembretes de Hoje ({lembretesHoje.length})
              </span>
              <button
                onClick={() => {
                  onClose()
                  if (onAbrirAgenda) onAbrirAgenda()
                }}
                className="text-xs font-bold text-rose-600 hover:underline"
              >
                + Agendar
              </button>
            </div>

            {lembretesHoje.length === 0 ? (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center space-y-1">
                <p className="text-xs text-slate-500 font-medium">Nenhum lembrete marcado para hoje ainda.</p>
                <button
                  onClick={() => {
                    onClose()
                    if (onAbrirAgenda) onAbrirAgenda()
                  }}
                  className="text-xs font-bold text-rose-600 hover:underline cursor-pointer"
                >
                  Toque aqui para agendar uma atividade
                </button>
              </div>
            ) : (
              lembretesHoje.map(item => {
                const cat = CATEGORIAS.find(c => c.id === item.categoria) || CATEGORIAS[0]
                const agora = new Date()
                const horaAtual = `${String(agora.getHours()).padStart(2, '0')}:${String(agora.getMinutes()).padStart(2, '0')}`
                const jaPassouDoHorario = horaAtual >= item.horario

                return (
                  <div
                    key={item.id}
                    className={`p-3.5 rounded-2xl border transition-all space-y-2 ${
                      item.concluido
                        ? 'bg-slate-50 border-slate-100 opacity-70'
                        : jaPassouDoHorario
                          ? 'bg-rose-50/50 border-rose-200 shadow-xs'
                          : 'bg-white border-slate-200/80 shadow-xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5 min-w-0 flex-1">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                          item.concluido
                            ? 'bg-emerald-100 text-emerald-600'
                            : jaPassouDoHorario
                              ? 'bg-rose-500 text-white animate-pulse'
                              : 'bg-rose-100 text-rose-600'
                        }`}>
                          <Bell className="w-4 h-4" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-black text-slate-900">
                              {item.titulo}
                            </span>
                            <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${cat.cor}`}>
                              {cat.label}
                            </span>
                          </div>

                          {item.observacao && (
                            <p className="text-xs text-slate-500 mt-0.5">
                              {item.observacao}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Badge do Horário Marcado */}
                      <div className="text-right shrink-0">
                        <div className={`text-xs font-black px-2 py-1 rounded-lg ${
                          item.concluido
                            ? 'bg-slate-100 text-slate-500'
                            : jaPassouDoHorario
                              ? 'bg-rose-500 text-white shadow-xs'
                              : 'bg-rose-50 text-rose-600 border border-rose-200'
                        }`}>
                          {item.horario}
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium block mt-0.5">
                          {item.concluido
                            ? 'Concluído'
                            : jaPassouDoHorario
                              ? 'Disparado'
                              : 'Marcado'}
                        </span>
                      </div>
                    </div>

                    {/* Ação rápida */}
                    <div className="flex items-center justify-between pt-1 border-t border-slate-100/80">
                      <span className="text-[11px] text-slate-400">
                        {item.concluido ? 'Tarefa cumprida' : `Alarme sonoro às ${item.horario}`}
                      </span>

                      <button
                        onClick={() => onAlternarConcluido(item.id)}
                        className={`text-xs font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all cursor-pointer ${
                          item.concluido
                            ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{item.concluido ? 'Desmarcar' : 'Concluir'}</span>
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Dica Informativa */}
          <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 flex items-center gap-2.5">
            <Volume2 className="w-4 h-4 text-rose-500 shrink-0" />
            <p className="text-[11px] text-slate-500 leading-snug">
              No minuto exato do lembrete, o telefone emite um card na tela e na barra de notificações com o som do alarme.
            </p>
          </div>

        </div>

        {/* Botão Fechar */}
        <button
          onClick={onClose}
          className="w-full py-3 bg-slate-900 text-white font-bold rounded-2xl text-xs"
        >
          Fechar
        </button>

      </div>
    </div>
  )
}
