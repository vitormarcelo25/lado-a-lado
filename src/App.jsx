import { useState } from 'react'
import UserView from './pages/UserView'
import GuardianView from './pages/GuardianView'


export default function App() {
  const [visao, setVisao] = useState('paciente')

  return (
    <main className="max-w-md mx-auto min-h-screen bg-gradient-to-b from-rose-50/40 via-white to-slate-50 text-slate-800 flex flex-col justify-between p-5 pb-8">
      {visao === 'paciente' ? (
        <UserView onGuardiao={() => setVisao('guardiao')} />
      ) : (
        <GuardianView voltar={() => setVisao('paciente')} />
      )}
    </main>
  )
}
