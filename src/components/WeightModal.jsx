import { useState } from 'react'
import { X, Scale } from 'lucide-react'

export default function WeightModal({ isOpen, onClose, onSave, latest }) {
  const [peso, setPeso] = useState(latest?.peso?.toString() || '')
  const [cintura, setCintura] = useState('')
  const [nota, setNota] = useState('')
  const [saving, setSaving] = useState(false)

  if (!isOpen) return null

  const handleSave = async () => {
    if (!peso) return
    setSaving(true)
    try {
      await onSave(parseFloat(peso), cintura ? parseFloat(cintura) : null, nota || null)
      setPeso('')
      setCintura('')
      setNota('')
      onClose()
    } catch {
      // error handled upstream
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
      <div className="bg-white w-full max-w-md rounded-t-2xl p-6 space-y-4 animate-in slide-in-from-bottom">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-slate-600" />
            <h2 className="text-lg font-bold text-slate-800">Registrar Peso</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-slate-600">Peso (kg)</label>
            <input
              type="number"
              step="0.1"
              value={peso}
              onChange={e => setPeso(e.target.value)}
              placeholder="Ex: 85.5"
              className="w-full mt-1 px-4 py-3 rounded-xl border border-slate-200 text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-rose-400"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-600">Cintura (cm) <span className="text-slate-400">opcional</span></label>
            <input
              type="number"
              step="0.1"
              value={cintura}
              onChange={e => setCintura(e.target.value)}
              placeholder="Ex: 92.0"
              className="w-full mt-1 px-4 py-3 rounded-xl border border-slate-200 text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-rose-400"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-600">Nota <span className="text-slate-400">opcional</span></label>
            <input
              type="text"
              value={nota}
              onChange={e => setNota(e.target.value)}
              placeholder="Ex: Pós-carnaval"
              className="w-full mt-1 px-4 py-3 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
            />
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={!peso || saving}
          className="w-full py-3 bg-rose-500 hover:bg-rose-600 disabled:bg-slate-300 text-white font-semibold rounded-xl transition-all active:scale-[0.98]"
        >
          {saving ? 'Salvando...' : 'Salvar'}
        </button>
      </div>
    </div>
  )
}
