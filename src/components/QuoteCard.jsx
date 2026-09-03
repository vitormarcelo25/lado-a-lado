import { Sparkles } from 'lucide-react'

export default function QuoteCard({ quote, isAiGenerated = false }) {
  if (!quote) return null

  return (
    <div className="bg-gradient-to-br from-rose-500 to-rose-600 rounded-2xl p-5 text-white shadow-lg shadow-rose-200">
      <div className="flex items-center justify-between">
        <p className="text-rose-100 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" /> Foco de Hoje
        </p>
        {isAiGenerated && (
          <span className="text-[10px] bg-white/20 backdrop-blur-xs px-2 py-0.5 rounded-full font-medium text-white">
            ✨ Gerado com IA
          </span>
        )}
      </div>
      <h2 className="text-lg font-bold mt-2 leading-snug">{quote}</h2>
    </div>
  )
}
