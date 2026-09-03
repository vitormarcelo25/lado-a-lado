import { Trophy, Pill } from 'lucide-react'

const WHATSAPP_NUMBER = import.meta.env.VITE_PATIENT_PHONE

const MESSAGES = {
  parabens: 'Oi! Vi aqui que voce mandou bem hoje! Muito orgulho da sua constancia. Continue assim!',
  lembrete: 'Oi parceira, nao esquece do remedio/agua de hoje! Como estao as coisas por ai?',
}

function buildLink(text) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`
}

export default function GuardianActions() {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
        Atalhos WhatsApp
      </h3>

      <a
        href={buildLink(MESSAGES.parabens)}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 w-full p-4 rounded-xl border border-amber-200 bg-amber-50 text-amber-800 font-semibold hover:bg-amber-100 transition-all active:scale-[0.98]"
      >
        <Trophy className="w-5 h-5 text-amber-600" />
        Mandar Parabens
      </a>

      <a
        href={buildLink(MESSAGES.lembrete)}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 w-full p-4 rounded-xl border border-sky-200 bg-sky-50 text-sky-800 font-semibold hover:bg-sky-100 transition-all active:scale-[0.98]"
      >
        <Pill className="w-5 h-5 text-sky-600" />
        Lembrete de Remedios/Agua
      </a>
    </div>
  )
}
