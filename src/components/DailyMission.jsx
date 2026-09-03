import { useState, useEffect } from 'react'
import { Zap, Check } from 'lucide-react'
import { getTodayMission, toggleMission } from '../services/supabase'

export default function DailyMission() {
  const [mission, setMission] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const data = await getTodayMission()
        setMission(data)
      } catch (err) {
        console.error('Erro ao carregar missao:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleToggle = async () => {
    if (!mission) return
    const newValue = !mission.concluida
    setMission(prev => ({ ...prev, concluida: newValue }))

    try {
      await toggleMission(mission.id, newValue)
    } catch (err) {
      console.error('Erro ao atualizar missao:', err)
      setMission(prev => ({ ...prev, concluida: !newValue }))
    }
  }

  if (loading || !mission) return null

  return (
    <button
      onClick={handleToggle}
      className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${
        mission.concluida
          ? 'bg-emerald-50/80 border-emerald-300'
          : 'bg-gradient-to-r from-violet-50 to-purple-50 border-violet-200'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
          mission.concluida ? 'bg-emerald-500 text-white' : 'bg-violet-500 text-white'
        }`}>
          <Zap className="w-5 h-5" />
        </div>
        <div className="text-left">
          <span className="text-[10px] font-bold text-violet-500 uppercase tracking-wider">Missao do Dia</span>
          <h3 className="text-sm font-semibold text-slate-800 leading-snug">{mission.missao}</h3>
        </div>
      </div>
      <Check className={`w-6 h-6 ${mission.concluida ? 'text-emerald-600' : 'text-slate-200'}`} />
    </button>
  )
}
