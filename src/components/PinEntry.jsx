import { useState } from 'react'
import { Lock } from 'lucide-react'

export default function PinEntry({ onVerify }) {
  const [pin, setPin] = useState('')
  const [error, setError] = useState(false)

  const validPin = import.meta.env.VITE_GUARDIAN_PIN || '1234'

  const handleChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 4)
    setPin(value)
    setError(false)

    if (value.length === 4) {
      if (value === validPin) {
        onVerify()
      } else {
        setError(true)
        setTimeout(() => setPin(''), 800)
      }
    }
  }

  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-xs space-y-6 text-center">
        <div className="space-y-2">
          <Lock className="w-10 h-10 text-slate-400 mx-auto" />
          <h1 className="text-xl font-bold text-slate-800">Acesso do Guardiao</h1>
          <p className="text-sm text-slate-500">Digite o PIN de 4 digitos</p>
        </div>

        <input
          type="password"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={4}
          value={pin}
          onChange={handleChange}
          autoFocus
          className={`w-full text-center text-2xl tracking-[0.5em] font-bold px-4 py-4 rounded-xl border-2 transition-all focus:outline-none ${
            error
              ? 'border-red-400 bg-red-50 text-red-600'
              : 'border-slate-200 text-slate-800 focus:border-rose-400'
          }`}
        />

        {error && (
          <p className="text-sm text-red-500 font-medium">PIN incorreto. Tente novamente.</p>
        )}
      </div>
    </div>
  )
}
