import { useState, useEffect } from 'react'
import { Beef, Wheat, Droplets, Check } from 'lucide-react'
import { getTodayProteinFiber, upsertProteinFiber } from '../services/supabase'

const ITENS = [
  { key: 'proteina_ok', icon: Beef, label: 'Proteina no prato', desc: 'Preservar massa magra', color: 'rose' },
  { key: 'fibras_ok', icon: Wheat, label: 'Fibras ingeridas', desc: 'Evitar constipacao', color: 'amber' },
  { key: 'agua_ok', icon: Droplets, label: 'Agua suficiente', desc: 'Minimo 2L hoje', color: 'sky' },
]

const COLOR_MAP = {
  rose: { active: 'bg-rose-50 border-rose-300', icon: 'bg-rose-500 text-white', inactive: 'bg-white border-slate-100' },
  amber: { active: 'bg-amber-50 border-amber-300', icon: 'bg-amber-500 text-white', inactive: 'bg-white border-slate-100' },
  sky: { active: 'bg-sky-50 border-sky-300', icon: 'bg-sky-500 text-white', inactive: 'bg-white border-slate-100' },
}

export default function ProteinFiberChecklist() {
  const [data, setData] = useState({ proteina_ok: false, fibras_ok: false, agua_ok: false })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const stored = await getTodayProteinFiber()
        if (stored) {
          setData({
            proteina_ok: stored.proteina_ok,
            fibras_ok: stored.fibras_ok,
            agua_ok: stored.agua_ok,
          })
        }
      } catch (err) {
        console.error('Erro ao carregar protein/fibras:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const toggle = async (key) => {
    const newValue = !data[key]
    const newData = { ...data, [key]: newValue }
    setData(newData)

    try {
      await upsertProteinFiber(newData)
    } catch (err) {
      console.error('Erro ao salvar:', err)
    }
  }

  if (loading) return null

  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-3">
      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
        Proteina & Fibras
      </span>

      <div className="space-y-2">
        {ITENS.map((item) => {
          const Icone = item.icon
          const active = data[item.key]
          const colors = COLOR_MAP[item.color]
          return (
            <button
              key={item.key}
              onClick={() => toggle(item.key)}
              className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
                active ? colors.active : colors.inactive
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${active ? colors.icon : 'bg-slate-100 text-slate-400'}`}>
                  <Icone className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <span className="text-sm font-semibold text-slate-800">{item.label}</span>
                  <p className="text-[10px] text-slate-400">{item.desc}</p>
                </div>
              </div>
              <Check className={`w-5 h-5 ${active ? 'text-emerald-600' : 'text-slate-200'}`} />
            </button>
          )
        })}
      </div>
    </div>
  )
}
