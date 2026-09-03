import { CheckCircle2 } from 'lucide-react'

export default function CheckinCard({ icon: Icon, label, active, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all active:scale-[0.98] ${
        active
          ? 'bg-emerald-50 border-emerald-300 text-emerald-900 shadow-sm'
          : 'bg-white border-slate-200 text-slate-700'
      }`}
    >
      <div className="flex items-center gap-3">
        <Icon className={`w-5 h-5 ${active ? 'text-emerald-600' : 'text-slate-400'}`} />
        <span className="font-semibold text-sm">{label}</span>
      </div>
      <CheckCircle2 className={`w-6 h-6 ${active ? 'text-emerald-600' : 'text-slate-300'}`} />
    </button>
  )
}
