import { useState, useEffect } from 'react'
import { Flame } from 'lucide-react'
import { getTodayHunger, upsertHunger } from '../services/supabase'

const TIPOS = [
  { key: 'fisica', emoji: '\u{1F7E2}', label: 'Fome Fisica', desc: 'Estomago vazio, fraqueza' },
  { key: 'vontade', emoji: '\u{1F7E1}', label: 'Vontade Especifica', desc: 'Desejo de sabor ou textura' },
  { key: 'emocional', emoji: '\u{1F534}', label: 'Fome Emocional', desc: 'Ansiedade, tedio, tristeza' },
]

export default function HungerThermometer() {
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const data = await getTodayHunger()
        if (data?.tipo) setSelected(data.tipo)
      } catch (err) {
        console.error('Erro ao carregar fome:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleSelect = async (key) => {
    const newValue = selected === key ? null : key
    setSelected(newValue)
    if (newValue) {
      try {
        await upsertHunger(newValue)
      } catch (err) {
        console.error('Erro ao salvar fome:', err)
      }
    }
  }

  if (loading) return null

  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-3">
      <div className="flex items-center gap-2">
        <Flame className="w-4 h-4 text-slate-400" />
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Termometro da Fome</span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {TIPOS.map((t) => {
          const sel = selected === t.key
          return (
            <button
              key={t.key}
              onClick={() => handleSelect(t.key)}
              className={`flex flex-col items-center p-3 rounded-2xl border transition-all ${
                sel ? 'border-rose-300 bg-rose-50/60 shadow-xs' : 'border-slate-100 bg-white'
              }`}
            >
              <span className="text-xl mb-1">{t.emoji}</span>
              <span className={`text-[10px] font-bold ${sel ? 'text-rose-800' : 'text-slate-600'}`}>
                {t.label}
              </span>
              <span className="text-[9px] text-slate-400 mt-0.5 leading-tight text-center">
                {t.desc}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
