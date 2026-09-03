import { useState, useEffect } from 'react'
import {
  Shield, ArrowLeft, Send, Activity, Syringe, AlertCircle,
  Flame, Beef, Trophy, Bell, Plus, Trash2, Clock,
  Sparkles, RefreshCw, Loader2
} from 'lucide-react'
import {
  getMetas, getAllCheckinsForDate, getWeightLogs,
  getTodaySideEffects, getTodayHunger, getTodayProteinFiber,
  getCurrentWeekVictories, getMounjaroSchedule,
  getGuardianNotifications, addGuardianNotification, deleteGuardianNotification,
  subscribeCheckins, subscribeSideEffects, subscribeProteinFiber,
  subscribeVictories, subscribeGuardianNotifications, removeChannel
} from '../services/supabase'
import { callGemini } from '../services/gemini'
import WeightChart from '../components/WeightChart'

const PATIENT_PHONE = import.meta.env.VITE_PATIENT_PHONE

export default function GuardianView({ voltar }) {
  const [autenticado, setAutenticado] = useState(false)
  const [pinDigitado, setPinDigitado] = useState('')
  const [hojeDados, setHojeDados] = useState(null)
  const [metas, setMetas] = useState(null)
  const [weightLogs, setWeightLogs] = useState([])
  const [sideEffects, setSideEffects] = useState(null)
  const [hunger, setHunger] = useState(null)
  const [proteinFiber, setProteinFiber] = useState(null)
  const [victories, setVictories] = useState(null)
  const [schedule, setSchedule] = useState(null)
  const [notifications, setNotifications] = useState([])
  const [notifTitulo, setNotifTitulo] = useState('')
  const [notifMensagem, setNotifMensagem] = useState('')
  const [notifHorario, setNotifHorario] = useState('20:00')
  const [loading, setLoading] = useState(true)

  // Estados de IA (Gemini)
  const [aiMessages, setAiMessages] = useState([])
  const [loadingAiMessages, setLoadingAiMessages] = useState(false)
  const [weeklySummary, setWeeklySummary] = useState(null)
  const [loadingWeeklySummary, setLoadingWeeklySummary] = useState(false)
  const hoje = new Date().toISOString().slice(0, 10)

  useEffect(() => {
    if (!autenticado) return

    let channels = []

    async function carregar() {
      try {
        const [dCheckin, dMetas, dPesos, dEffects, dHunger, dPF, dVictories, dSchedule, dNotifs] = await Promise.all([
          getAllCheckinsForDate(hoje),
          getMetas(),
          getWeightLogs(),
          getTodaySideEffects(),
          getTodayHunger(),
          getTodayProteinFiber(),
          getCurrentWeekVictories(),
          getMounjaroSchedule(),
          getGuardianNotifications(),
        ])
        if (dCheckin) setHojeDados(dCheckin)
        if (dMetas) setMetas(dMetas)
        if (dPesos) setWeightLogs(dPesos)
        if (dEffects) setSideEffects(dEffects)
        if (dHunger) setHunger(dHunger)
        if (dPF) setProteinFiber(dPF)
        if (dVictories) setVictories(dVictories)
        if (dSchedule) setSchedule(dSchedule)
        if (dNotifs) setNotifications(dNotifs)
      } catch (err) {
        console.error('Erro ao carregar dados do guardiao:', err)
      } finally {
        setLoading(false)
      }

      const c1 = subscribeCheckins((p) => {
        if (p.new && p.new.data === hoje) setHojeDados(p.new)
      })
      const c2 = subscribeSideEffects((p) => {
        if (p.new && p.new.data === hoje) setSideEffects(p.new)
      })
      const c3 = subscribeProteinFiber((p) => {
        if (p.new && p.new.data === hoje) setProteinFiber(p.new)
      })
      const c4 = subscribeVictories((p) => {
        if (p.new) setVictories(p.new)
      })
      const c5 = subscribeGuardianNotifications(() => {
        getGuardianNotifications().then(setNotifications)
      })

      channels = [c1, c2, c3, c4, c5]
    }

    carregar()

    return () => {
      channels.forEach(c => removeChannel(c))
    }
  }, [autenticado, hoje])

  const handleLogin = (e) => {
    e.preventDefault()
    const pin = import.meta.env.VITE_GUARDIAN_PIN || '1234'
    if (pinDigitado === pin) {
      setAutenticado(true)
    } else {
      alert('PIN incorreto!')
      setPinDigitado('')
    }
  }

  const pesoPerdido = metas?.peso_inicial > 0 && metas?.peso_atual > 0
    ? (metas.peso_inicial - metas.peso_atual).toFixed(1)
    : null

  const linkIncentivo = (msg) =>
    `https://wa.me/${PATIENT_PHONE}?text=${encodeURIComponent(msg)}`

  const hungerLabel = { fisica: 'Fome Fisica', vontade: 'Vontade Especifica', emocional: 'Fome Emocional' }

  const gerarMensagensIA = async () => {
    setLoadingAiMessages(true)
    try {
      const res = await callGemini('guardian_messages', {
        streak: weightLogs?.length || 1,
        pesoPerdido,
        alimentacao: hojeDados?.alimentacao,
        agua: hojeDados?.agua || 0,
        efeitos: sideEffects,
        vitorias: victories,
        humor: hojeDados?.humor || 'bem'
      })
      if (res?.opcoes?.length) {
        setAiMessages(res.opcoes)
      }
    } catch (err) {
      console.error('Erro ao gerar mensagens de apoio com IA:', err)
    } finally {
      setLoadingAiMessages(false)
    }
  }

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

  return (
    <section className="space-y-5">
      <header className="flex items-center justify-between border-b pb-3 border-slate-100">
        <button onClick={voltar} className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
          <ArrowLeft className="w-4 h-4" /> Voltar ao App
        </button>
        {autenticado && (
          <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            <Activity className="w-3.5 h-3.5 animate-pulse text-emerald-600" /> Ao Vivo
          </span>
        )}
      </header>

      {!autenticado ? (
        <form onSubmit={handleLogin} className="space-y-4 pt-12 text-center">
          <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto text-rose-500 mb-2">
            <Shield className="w-7 h-7" />
          </div>
          <h2 className="font-black text-xl text-slate-800">Painel do Guardiao</h2>
          <p className="text-xs text-slate-500">Digite seu PIN de 4 digitos</p>
          <input
            type="password"
            maxLength={4}
            value={pinDigitado}
            onChange={(e) => setPinDigitado(e.target.value)}
            placeholder="****"
            className="w-36 text-center tracking-[10px] text-2xl py-3 border border-slate-200 rounded-2xl mx-auto focus:ring-2 focus:ring-rose-500 outline-none"
            autoFocus
          />
          <button type="submit" className="w-full py-3.5 bg-slate-900 text-white font-bold rounded-2xl text-sm">
            Entrar
          </button>
        </form>
      ) : loading ? (
        <div className="text-center py-12 text-slate-400 text-sm">Carregando dados...</div>
      ) : (
        <div className="space-y-4">
          {metas && (
            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Evolucao do Tratamento</span>
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

          {schedule && (
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
              <Syringe className="w-5 h-5 text-violet-500" />
              <div>
                <span className="text-xs font-bold text-slate-500">Mounjaro</span>
                <p className="text-sm font-semibold text-slate-800">Todo{schedule.dia_semana === 'seg' ? 'a Segunda' : schedule.dia_semana === 'ter' ? 'a Terca' : schedule.dia_semana === 'qua' ? 'a Quarta' : schedule.dia_semana === 'qui' ? 'a Quinta' : schedule.dia_semana === 'sex' ? 'a Sexta' : schedule.dia_semana === 'sab' ? 'o Sabado' : 'o Domingo'}</p>
              </div>
            </div>
          )}

          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Status Diario Dela</span>
            <div className="grid grid-cols-2 gap-2 text-center text-xs">
              <div className={`p-3 rounded-2xl border ${hojeDados?.alimentacao ? 'bg-emerald-50 border-emerald-200 text-emerald-900 font-bold' : 'bg-slate-50 text-slate-400'}`}>
                Dieta<br />{hojeDados?.alimentacao ? 'Firme' : 'Pendente'}
              </div>
              <div className={`p-3 rounded-2xl border ${(hojeDados?.agua || 0) >= 8 ? 'bg-emerald-50 border-emerald-200 text-emerald-900 font-bold' : 'bg-slate-50 text-slate-400'}`}>
                Agua<br />{(hojeDados?.agua || 0) * 250}ml
              </div>
            </div>
          </div>

          {sideEffects && (
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-bold text-slate-500 uppercase">Efeitos Colaterais</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {sideEffects.bem && <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded-lg font-semibold">100% Bem</span>}
                {sideEffects.nauseas && <span className="text-xs bg-amber-50 text-amber-700 px-2 py-1 rounded-lg font-semibold">Nausea</span>}
                {sideEffects.azia && <span className="text-xs bg-orange-50 text-orange-700 px-2 py-1 rounded-lg font-semibold">Azia</span>}
                {sideEffects.constipacao && <span className="text-xs bg-sky-50 text-sky-700 px-2 py-1 rounded-lg font-semibold">Constipacao</span>}
                {sideEffects.saciedade && <span className="text-xs bg-rose-50 text-rose-700 px-2 py-1 rounded-lg font-semibold">Saciedade</span>}
              </div>
            </div>
          )}

          {hunger && (
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
              <Flame className="w-5 h-5 text-amber-500" />
              <div>
                <span className="text-xs font-bold text-slate-500">Fome Hoje</span>
                <p className="text-sm font-semibold text-slate-800">{hungerLabel[hunger.tipo] || 'Nao registrada'}</p>
              </div>
            </div>
          )}

          {proteinFiber && (
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-2">
              <div className="flex items-center gap-2">
                <Beef className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-bold text-slate-500 uppercase">Proteina & Fibras</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5 text-center text-[10px]">
                <div className={`p-2 rounded-lg border ${proteinFiber.proteina_ok ? 'bg-rose-50 text-rose-700 font-bold' : 'bg-slate-50 text-slate-400'}`}>
                  Proteina<br />{proteinFiber.proteina_ok ? 'OK' : 'Pendente'}
                </div>
                <div className={`p-2 rounded-lg border ${proteinFiber.fibras_ok ? 'bg-amber-50 text-amber-700 font-bold' : 'bg-slate-50 text-slate-400'}`}>
                  Fibras<br />{proteinFiber.fibras_ok ? 'OK' : 'Pendente'}
                </div>
                <div className={`p-2 rounded-lg border ${proteinFiber.agua_ok ? 'bg-sky-50 text-sky-700 font-bold' : 'bg-slate-50 text-slate-400'}`}>
                  Agua<br />{proteinFiber.agua_ok ? 'OK' : 'Pendente'}
                </div>
              </div>
            </div>
          )}

          {victories && (
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-2">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-bold text-slate-500 uppercase">Vitorias da Semana</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {victories.roupas_folgadas && <span className="text-xs bg-amber-50 text-amber-700 px-2 py-1 rounded-lg font-semibold">Roupas folgadas</span>}
                {victories.folego_melhor && <span className="text-xs bg-amber-50 text-amber-700 px-2 py-1 rounded-lg font-semibold">Mais folego</span>}
                {victories.comida_no_prato && <span className="text-xs bg-amber-50 text-amber-700 px-2 py-1 rounded-lg font-semibold">Comida no prato</span>}
                {victories.disposicao_alta && <span className="text-xs bg-amber-50 text-amber-700 px-2 py-1 rounded-lg font-semibold">Disposicao alta</span>}
              </div>
            </div>
          )}

          {/* Card de Insights & Resumo Semanal com IA */}
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
                  <span className="text-[10px] font-bold text-violet-300 uppercase tracking-wider block">💡 Dica Prática para Você</span>
                  <p className="text-slate-200 leading-relaxed">{weeklySummary.dica_para_guardiao}</p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 pt-1">
                Gere um resumo inteligente com base nos check-ins, peso e vitórias da semana para orientar seu apoio como guardião.
              </p>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mensagens de Apoio</span>
              <button
                onClick={gerarMensagensIA}
                disabled={loadingAiMessages}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white rounded-xl text-xs font-bold shadow-xs transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {loadingAiMessages ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Criando...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Sugerir com IA</span>
                  </>
                )}
              </button>
            </div>

            {/* Mensagens geradas por IA */}
            {aiMessages.length > 0 && (
              <div className="space-y-2 p-3 bg-rose-50/70 border border-rose-200 rounded-3xl">
                <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-rose-500" /> Sugestões Personalizadas para Hoje (Gemini IA):
                </span>
                {aiMessages.map((op, idx) => (
                  <div key={idx} className="bg-white p-3.5 rounded-2xl border border-rose-100 shadow-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">{op.titulo}</span>
                      <a
                        href={linkIncentivo(op.mensagem)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[11px] font-bold transition-all shadow-xs shrink-0"
                      >
                        <span>Enviar no WhatsApp</span>
                        <Send className="w-3 h-3" />
                      </a>
                    </div>
                    <p className="text-xs text-slate-600 italic">"{op.mensagem}"</p>
                  </div>
                ))}
              </div>
            )}

            {/* Modelos rápidos prontos */}
            <a
              href={linkIncentivo('Oi! Vi aqui que voce mandou bem hoje! Muito orgulho da sua constancia! 🔥❤️')}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold transition-all shadow-xs"
            >
              <span>Mandar Parabens</span>
              <Send className="w-4 h-4" />
            </a>
            <a
              href={linkIncentivo('Passando pra conferir se voce ja bebeu sua agua e comeu proteina hoje! Tamo junto nessa. 💧🥩')}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 bg-sky-600 hover:bg-sky-700 text-white rounded-2xl text-xs font-bold transition-all shadow-xs"
            >
              <span>Cobrar Proteina & Agua</span>
              <Send className="w-4 h-4" />
            </a>
            <a
              href={linkIncentivo('Oi! Como esta se sentindo com o Mounjaro? Algum efeito colateral? Estou aqui pra te ajudar! 💜')}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 bg-violet-600 hover:bg-violet-700 text-white rounded-2xl text-xs font-bold transition-all shadow-xs"
            >
              <span>Checar Efeitos do Mounjaro</span>
              <Send className="w-4 h-4" />
            </a>
            <a
              href={linkIncentivo('Vi suas vitorias da semana! Roupas mais folgadas, mais folego... voce esta arrasando! Continue assim! 🏆✨')}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl text-xs font-bold transition-all shadow-xs"
            >
              <span>Parabenizar Vitorias</span>
              <Send className="w-4 h-4" />
            </a>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-violet-500" />
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Notificacoes para Ela</span>
            </div>

            <div className="space-y-2">
              {notifications.map((n) => (
                <div key={n.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <div>
                      <span className="text-xs font-bold text-slate-700">{n.horario?.slice(0, 5)}</span>
                      <span className="text-xs text-slate-500 ml-2">{n.titulo}</span>
                    </div>
                  </div>
                  <button
                    onClick={async () => {
                      await deleteGuardianNotification(n.id)
                      setNotifications(prev => prev.filter(x => x.id !== n.id))
                    }}
                    className="p-1 text-red-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Nova Notificacao</span>
              <input
                type="text"
                value={notifTitulo}
                onChange={(e) => setNotifTitulo(e.target.value)}
                placeholder="Titulo (ex: Lembrete)"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-violet-500"
              />
              <input
                type="text"
                value={notifMensagem}
                onChange={(e) => setNotifMensagem(e.target.value)}
                placeholder="Mensagem para ela..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-violet-500"
              />
              <div className="flex gap-2">
                <input
                  type="time"
                  value={notifHorario}
                  onChange={(e) => setNotifHorario(e.target.value)}
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-violet-500"
                />
                <button
                  onClick={async () => {
                    if (!notifTitulo || !notifMensagem) return
                    const n = await addGuardianNotification(notifTitulo, notifMensagem, notifHorario)
                    setNotifications(prev => [...prev, n])
                    setNotifTitulo('')
                    setNotifMensagem('')
                  }}
                  className="flex items-center gap-1 px-4 py-2 bg-violet-500 text-white text-xs font-bold rounded-xl hover:bg-violet-600 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Agendar
                </button>
              </div>
            </div>
          </div>

          <WeightChart logs={weightLogs} />
        </div>
      )}
    </section>
  )
}
