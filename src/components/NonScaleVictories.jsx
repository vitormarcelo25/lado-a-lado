import { useState, useEffect } from 'react'
import { Trophy, Check } from 'lucide-react'
import { getCurrentWeekVictories, upsertWeekVictories } from '../services/supabase'

const VITORIAS = [
  { key: 'roupas_folgadas', label: 'Roupas mais folgadas' },
  { key: 'folego_melhor', label: 'Mais folego ao caminhar' },
  { key: 'comida_no_prato', label: 'Deixei comida no prato' },
  { key: 'disposicao_alta', label: 'Disposicao alta' },
]

export default function NonScaleVictories() {
  const [vitorias, setVitorias] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const data = await getCurrentWeekVictories()
        if (data) {
          setVitorias({
            roupas_folgadas: data.roupas_folgadas,
            folego_melhor: data.folego_melhor,
            comida_no_prato: data.comida_no_prato,
            disposicao_alta: data.disposicao_alta,
          })
        }
      } catch (err) {
        console.error('Erro ao carregar vitorias:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const toggle = async (key) => {
    const newValue = !vitorias[key]
    const newData = { ...vitorias, [key]: newValue }
    setVitorias(newData)

    try {
      await upsertWeekVictories(newData)
    } catch (err) {
      console.error('Erro ao salvar vitoria:', err)
    }
  }

  if (loading) return null

  const total = Object.values(vitorias).filter(Boolean).length

  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-500" />
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Vitorias da Semana</span>
        </div>
        {total > 0 && (
          <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-lg">
            {total}/{VITORIAS.length}
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        {VITORIAS.map((v) => {
          const active = vitorias[v.key]
          return (
            <button
              key={v.key}
              onClick={() => toggle(v.key)}
              className={`flex items-center gap-2 p-3 rounded-xl border text-left transition-all ${
                active ? 'bg-amber-50 border-amber-300' : 'bg-white border-slate-100'
              }`}
            >
              <div className={`w-5 h-5 rounded-md flex items-center justify-center ${
                active ? 'bg-amber-500 text-white' : 'bg-slate-100'
              }`}>
                {active && <Check className="w-3 h-3" />}
              </div>
              <span className={`text-xs font-semibold ${active ? 'text-amber-800' : 'text-slate-600'}`}>
                {v.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
