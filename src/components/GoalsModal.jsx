import { useState, useEffect } from 'react'
import { X, Target } from 'lucide-react'
import { upsertMetas, getMetas } from '../services/supabase'

export default function GoalsModal({ isOpen, onClose, onMetasUpdated }) {
  const [inicial, setInicial] = useState('')
  const [meta, setMeta] = useState('')
  const [metasAtuais, setMetasAtuais] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (isOpen) {
      getMetas().then(data => {
        if (data) {
          setMetasAtuais(data)
          setInicial(data.peso_inicial?.toString() || '')
          setMeta(data.peso_meta?.toString() || '')
        }
      })
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleSave = async () => {
    if (!inicial || !meta) return
    setSaving(true)
    try {
      await upsertMetas({
        ...metasAtuais,
        peso_inicial: parseFloat(inicial),
        peso_meta: parseFloat(meta)
      })
      if (onMetasUpdated) onMetasUpdated()
      onClose()
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-sm rounded-3xl p-6 space-y-5 animate-in zoom-in-95">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500">
              <Target className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-slate-800">Definir Metas</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-slate-100 transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Peso Inicial (kg)</label>
            <input
              type="number"
              step="0.1"
              value={inicial}
              onChange={e => setInicial(e.target.value)}
              placeholder="Ex: 95.5"
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-rose-400/50"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Peso Meta (kg)</label>
            <input
              type="number"
              step="0.1"
              value={meta}
              onChange={e => setMeta(e.target.value)}
              placeholder="Ex: 75.0"
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-rose-400/50"
            />
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={!inicial || !meta || saving}
          className="w-full py-3.5 bg-slate-900 hover:bg-black disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold rounded-2xl transition-all shadow-md active:scale-95"
        >
          {saving ? 'Salvando...' : 'Salvar Metas'}
        </button>
      </div>
    </div>
  )
}
