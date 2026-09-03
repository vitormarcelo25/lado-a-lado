import { useState, useEffect } from 'react'
import { AlertCircle } from 'lucide-react'
import { getTodaySideEffects, upsertSideEffects } from '../services/supabase'

const EFEITOS = [
  { key: 'bem', label: '100% Bem', emoji: '', color: 'emerald' },
  { key: 'nauseas', label: 'Nausea Leve', emoji: '', color: 'amber' },
  { key: 'azia', label: 'Azia/Refluxo', emoji: '', color: 'orange' },
  { key: 'constipacao', label: 'Constipacao', emoji: '', color: 'sky' },
  { key: 'saciedade', label: 'Saciedade Extrema', emoji: '', color: 'rose' },
]

const COLOR_MAP = {
  emerald: { active: 'bg-emerald-50 border-emerald-300 text-emerald-800', dot: 'bg-emerald-500' },
  amber: { active: 'bg-amber-50 border-amber-300 text-amber-800', dot: 'bg-amber-500' },
  orange: { active: 'bg-orange-50 border-orange-300 text-orange-800', dot: 'bg-orange-500' },
  sky: { active: 'bg-sky-50 border-sky-300 text-sky-800', dot: 'bg-sky-500' },
  rose: { active: 'bg-rose-50 border-rose-300 text-rose-800', dot: 'bg-rose-500' },
}

export default function SideEffectsChecklist() {
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const data = await getTodaySideEffects()
        if (data) {
          const active = EFEITOS.find(e => data[e.key])
          if (active) setSelected(active.key)
        }
      } catch (err) {
        console.error('Erro ao carregar efeitos:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleSelect = async (key) => {
    const newValue = selected === key ? null : key
    setSelected(newValue)

    const effects = { nauseas: false, azia: false, constipacao: false, saciedade: false, bem: false }
    if (newValue) effects[newValue] = true

    try {
      await upsertSideEffects(effects)
    } catch (err) {
      console.error('Erro ao salvar efeito:', err)
    }
  }

  if (loading) return null

  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-3">
      <div className="flex items-center gap-2">
        <AlertCircle className="w-4 h-4 text-slate-400" />
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Como esta o corpo?</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {EFEITOS.map((e) => {
          const sel = selected === e.key
          const colors = COLOR_MAP[e.color]
          return (
            <button
              key={e.key}
              onClick={() => handleSelect(e.key)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-all ${
                sel ? colors.active : 'bg-white border-slate-100 text-slate-500'
              }`}
            >
              <span>{e.emoji}</span>
              <span>{e.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
