import { useState } from 'react'
import { X, MessageCircleHeart, Sparkles, HeartHandshake, CheckCircle, Loader2 } from 'lucide-react'
import { callGemini } from '../services/gemini'

const MOTIVOS = [
  { id: 'ansiedade', label: 'Comi por ansiedade / fora do plano', emoji: '💔' },
  { id: 'desanimo', label: 'Desânimo e vontade de desistir', emoji: '🌧️' },
  { id: 'culpa', label: 'Culpa ou remorso pós-refeição', emoji: '⚡' },
  { id: 'vontade', label: 'Vontade intensa e incontrolável', emoji: '🌪️' },
]

export default function SosModal({ isOpen, onClose }) {
  const [motivoSelecionado, setMotivoSelecionado] = useState('ansiedade')
  const [loadingAi, setLoadingAi] = useState(false)
  const [aiSupport, setAiSupport] = useState(null)
  const [sent, setSent] = useState(false)

  if (!isOpen) return null

  const whatsappNumber = import.meta.env.VITE_MENTOR_PHONE
  const sosMessage = `Oi! O dia hoje ficou difícil (${MOTIVOS.find(m => m.id === motivoSelecionado)?.label || 'desânimo'}). Preciso do seu apoio para me manter firme no plano.`
  const link = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(sosMessage)}`

  const handleOpenWhatsapp = () => {
    setSent(true)
    window.open(link, '_blank')
  }

  const handleObterAcolhimento = async (motivoId) => {
    const targetMotivo = motivoId || motivoSelecionado
    setLoadingAi(true)
    try {
      const motivoLabel = MOTIVOS.find(m => m.id === targetMotivo)?.label || targetMotivo
      const res = await callGemini('sos_support', { motivo: motivoLabel })
      if (res && res.acolhimento) {
        setAiSupport(res)
      } else {
        setAiSupport({
          acolhimento: 'Respire com calma. O que você está sentindo agora é temporário. Um deslize não anula a sua jornada nem a sua determinação.',
          passos_praticos: [
            'Beba um copo cheio de água fresca devagar.',
            'Respire fundo três vezes antes de tomar qualquer outra atitude.',
            'Lembre-se que o próximo prato já é uma nova chance.'
          ],
          mantra: 'Eu me acolho e sigo em frente, sem culpa e sem punição.'
        })
      }
    } catch (err) {
      console.error('Erro ao buscar acolhimento IA:', err)
    } finally {
      setLoadingAi(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-end justify-center p-0 sm:p-4">
      <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl p-6 space-y-4 max-h-[90vh] overflow-y-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="flex items-center justify-between pb-1 border-b border-slate-100">
          <div className="flex items-center gap-2 text-rose-600">
            <HeartHandshake className="w-5 h-5" />
            <h2 className="text-lg font-bold text-slate-800">Espaço de Acolhimento</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-100 text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Bloco de Primeiros Socorros Emocionais com IA */}
        <div className="space-y-3">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            O que você está sentindo agora?
          </span>

          <div className="grid grid-cols-2 gap-2">
            {MOTIVOS.map((m) => {
              const sel = motivoSelecionado === m.id
              return (
                <button
                  key={m.id}
                  onClick={() => {
                    setMotivoSelecionado(m.id)
                    handleObterAcolhimento(m.id)
                  }}
                  className={`flex items-start gap-2 p-3 text-left rounded-2xl border text-xs transition-all ${
                    sel
                      ? 'border-rose-300 bg-rose-50/70 text-rose-900 font-semibold shadow-xs'
                      : 'border-slate-100 bg-slate-50/60 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-base">{m.emoji}</span>
                  <span className="leading-tight">{m.label}</span>
                </button>
              )
            })}
          </div>

          {!aiSupport && !loadingAi && (
            <button
              onClick={() => handleObterAcolhimento()}
              className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white rounded-2xl text-xs font-bold shadow-md shadow-rose-200 transition-all active:scale-[0.98]"
            >
              <Sparkles className="w-4 h-4" />
              Receber Acolhimento Imediato com IA
            </button>
          )}

          {loadingAi && (
            <div className="flex flex-col items-center justify-center py-6 bg-rose-50/50 rounded-2xl border border-rose-100 space-y-2">
              <Loader2 className="w-6 h-6 text-rose-500 animate-spin" />
              <p className="text-xs text-rose-700 font-medium">Buscando as palavras certas para você...</p>
            </div>
          )}

          {aiSupport && !loadingAi && (
            <div className="bg-rose-50/70 border border-rose-100 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-1.5 text-rose-600 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" /> Acolhimento do Coração
              </div>
              <p className="text-xs text-slate-700 leading-relaxed italic">
                "{aiSupport.acolhimento}"
              </p>

              {aiSupport.passos_praticos && (
                <div className="space-y-1.5 pt-1 border-t border-rose-100/80">
                  <span className="text-[10px] font-bold text-rose-700 uppercase">3 Passos para os próximos 15 minutos:</span>
                  <ul className="space-y-1">
                    {aiSupport.passos_praticos.map((passo, idx) => (
                      <li key={idx} className="flex items-start gap-1.5 text-xs text-slate-600">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{passo}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {aiSupport.mantra && (
                <div className="bg-white/80 rounded-xl p-2.5 text-center border border-rose-100">
                  <span className="text-[10px] font-bold text-rose-500 uppercase block">Seu mantra de alívio:</span>
                  <p className="text-xs font-bold text-slate-800">“{aiSupport.mantra}”</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Ação com Guardião */}
        <div className="pt-2 border-t border-slate-100 space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Seu Guardião está a um clique
          </span>

          {!sent ? (
            <button
              onClick={handleOpenWhatsapp}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-xs transition-all shadow-sm active:scale-[0.98]"
            >
              <MessageCircleHeart className="w-4 h-4" />
              Avisar meu Mentor no WhatsApp
            </button>
          ) : (
            <div className="text-center py-2.5 bg-emerald-50 text-emerald-700 font-semibold text-xs rounded-xl border border-emerald-100">
              Mensagem pronta no WhatsApp! Seu mentor está com você.
            </div>
          )}

          <button
            onClick={onClose}
            className="w-full py-2.5 text-xs text-slate-500 font-medium hover:text-slate-700 transition-colors"
          >
            Fechar e respirar com calma
          </button>
        </div>
      </div>
    </div>
  )
}
