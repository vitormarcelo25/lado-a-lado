import { Flame } from 'lucide-react'

export default function StreakCounter({ streak }) {
  if (streak === 0) return null

  return (
    <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-xl px-4 py-2">
      <Flame className="w-5 h-5 text-orange-500" />
      <span className="text-sm font-bold text-orange-700">
        {streak} {streak === 1 ? 'dia' : 'dias'} seguidos
      </span>
    </div>
  )
}
