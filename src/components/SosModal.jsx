import { useState } from 'react'
import { X, MessageCircleHeart } from 'lucide-react'

const SOS_MESSAGE = 'Oi! O dia hoje ficou difícil e acabei desanimando/comendo fora do plano. Preciso do seu apoio para voltar ao foco hoje mesmo.'

export default function SosModal({ isOpen, onClose }) {
  const [sent, setSent] = useState(false)

  if (!isOpen) return null

  const whatsappNumber = import.meta.env.VITE_MENTOR_PHONE
  const link = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(SOS_MESSAGE)}`

  const handleOpen = () => {
    setSent(true)
    window.open(link, '_blank')
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
      <div className="bg-white w-full max-w-md rounded-t-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800">Estou aqui com voce</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="bg-rose-50 rounded-xl p-4 text-center space-y-2">
          <p className="text-slate-700 text-sm leading-relaxed">
            Um dia dificil nao apaga todo o progresso que voce ja construiu.
            Recomecar aqui e agora faz parte do plano.
          </p>
          <p className="text-slate-500 text-xs">
            Se precisar, fale diretamente com o seu mentor:
          </p>
        </div>

        {!sent ? (
          <button
            onClick={handleOpen}
            className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-all active:scale-[0.98]"
          >
            <MessageCircleHeart className="w-5 h-5" />
            Falar com meu mentor no WhatsApp
          </button>
        ) : (
          <div className="text-center py-3 text-emerald-700 font-semibold text-sm">
            Mensagem enviada! Seu mentor vai te ajudar.
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full py-3 border border-slate-200 text-slate-600 font-medium rounded-xl hover:bg-slate-50 transition-all"
        >
          Voltar
        </button>
      </div>
    </div>
  )
}
