import { X, Clock, Syringe, Wind, MessageCircleHeart, Heart } from 'lucide-react'

const PASSOS = [
  {
    icon: Clock,
    titulo: 'Rotina da Noite (1 minuto)',
    desc: 'Antes de dormir, registre uma unica vez: a agua aproximada, se as refeicoes seguiram o plano e seu humor do dia.',
    cor: 'bg-blue-50 text-blue-600',
  },
  {
    icon: Syringe,
    titulo: 'Dose do Mounjaro (1x por semana)',
    desc: 'Toque em "Registrar Dose" somente no momento da injecao, marcando o local do corpo aplicado.',
    cor: 'bg-violet-50 text-violet-600',
  },
  {
    icon: Wind,
    titulo: 'Pausa de 3 Minutos',
    desc: 'Acionar quando surgir ansiedade incontrolavel de comer fora de hora para respirar e avaliar a fome.',
    cor: 'bg-amber-50 text-amber-600',
  },
  {
    icon: MessageCircleHeart,
    titulo: 'Botao SOS',
    desc: 'Apertar sem medo ou culpa quando houver desanimo ou recaidas para abrir o WhatsApp direto com o Guardiao.',
    cor: 'bg-rose-50 text-rose-600',
  },
]

export default function GuiaModal({ aberto, fechar }) {
  if (!aberto) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center">
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-lg text-slate-800">Como Usar o App</h2>
          <button onClick={fechar} className="p-1 rounded-lg hover:bg-slate-100">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="space-y-3">
          {PASSOS.map((p, i) => {
            const Icone = p.icon
            return (
              <div key={i} className="flex gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${p.cor}`}>
                  <Icone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">{p.titulo}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed mt-0.5">{p.desc}</p>
                </div>
              </div>
            )
          })}
        </div>

        <div className="bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-100 rounded-2xl p-4 text-center space-y-2">
          <Heart className="w-6 h-6 text-rose-400 mx-auto" />
          <h3 className="text-sm font-bold text-rose-700">Regra de Ouro</h3>
          <p className="text-xs text-rose-600 leading-relaxed">
            Nao precisa ser perfeito. O segredo e nao sumir apos um dia dificil.
            Recomecar sempre e permitido.
          </p>
        </div>

        <button
          onClick={fechar}
          className="w-full py-3 bg-slate-900 text-white font-bold rounded-2xl text-sm"
        >
          Entendi!
        </button>
      </div>
    </div>
  )
}
