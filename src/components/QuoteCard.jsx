import { Sparkles } from 'lucide-react'

export default function QuoteCard({ quote }) {
  if (!quote) return null

  return (
    <div className="bg-gradient-to-br from-rose-500 to-rose-600 rounded-2xl p-5 text-white shadow-lg shadow-rose-200">
      <p className="text-rose-100 text-sm font-medium flex items-center gap-1">
        <Sparkles className="w-4 h-4" /> Lembrete de hoje
      </p>
      <h1 className="text-lg font-bold mt-2 leading-snug">{quote}</h1>
    </div>
  )
}
