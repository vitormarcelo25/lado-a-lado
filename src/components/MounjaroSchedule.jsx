import { useState, useEffect } from 'react'
import { Syringe, Check, Calendar } from 'lucide-react'
import { getMounjaroSchedule, confirmMounjaroApplication, getMounjaroApplications } from '../services/supabase'

const DIAS = [
  { key: 'dom', label: 'Dom' },
  { key: 'seg', label: 'Seg' },
  { key: 'ter', label: 'Ter' },
  { key: 'qua', label: 'Qua' },
  { key: 'qui', label: 'Qui' },
  { key: 'sex', label: 'Sex' },
  { key: 'sab', label: 'Sab' },
]

function daysUntilDay(targetDay) {
  const dayMap = { dom: 0, seg: 1, ter: 2, qua: 3, qui: 4, sex: 5, sab: 6 }
  const today = new Date().getDay()
  const target = dayMap[targetDay]
  const diff = (target - today + 7) % 7
  return diff === 0 ? 7 : diff
}

export default function MounjaroSchedule() {
  const [schedule, setSchedule] = useState(null)
  const [aplicadoHoje, setAplicadoHoje] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [sched, apps] = await Promise.all([
          getMounjaroSchedule(),
          getMounjaroApplications(1),
        ])
        setSchedule(sched)
        const hoje = new Date().toISOString().slice(0, 10)
        setAplicadoHoje(apps.some(a => a.data === hoje && a.aplicado))
      } catch (err) {
        console.error('Erro ao carregar agenda Mounjaro:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleConfirm = async () => {
    try {
      await confirmMounjaroApplication()
      setAplicadoHoje(true)
    } catch (err) {
      console.error('Erro ao confirmar aplicacao:', err)
    }
  }

  if (loading) return null

  const diaAtual = schedule?.dia_semana || 'qui'
  const diasParaAplicacao = daysUntilDay(diaAtual)
  const diaLabel = DIAS.find(d => d.key === diaAtual)?.label || diaAtual

  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
            <Syringe className="w-4 h-4 text-violet-600" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">Mounjaro</h3>
            <p className="text-[10px] text-slate-500">Aplicacao semanal</p>
          </div>
        </div>
        {!aplicadoHoje && (
          <button
            onClick={handleConfirm}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-500 text-white text-xs font-bold rounded-lg hover:bg-violet-600 transition-all active:scale-95"
          >
            <Check className="w-3.5 h-3.5" />
            Ja apliquei
          </button>
        )}
        {aplicadoHoje && (
          <span className="flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-200">
            <Check className="w-3.5 h-3.5" />
            Aplicado
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 text-xs text-slate-600">
        <Calendar className="w-3.5 h-3.5 text-slate-400" />
        <span>
          Toda{diaAtual === 'seg' || diaAtual === 'qua' || diaAtual === 'sex' || diaAtual === 'sab' ? '' : ''} <strong>{diaLabel}</strong>
          {aplicadoHoje ? (
            <span className="text-emerald-600 ml-1">- proxima em {diasParaAplicacao} dias</span>
          ) : (
            <span className="text-violet-600 ml-1">- faltam {diasParaAplicacao} dias</span>
          )}
        </span>
      </div>
    </div>
  )
}
