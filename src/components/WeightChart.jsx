import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

export default function WeightChart({ logs }) {
  if (!logs || logs.length < 2) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
        <p className="text-sm text-slate-400">Registre pelo menos 2 pesos para ver o grafico.</p>
      </div>
    )
  }

  const chartData = logs.map(l => ({
    date: new Date(l.data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
    peso: Number(l.peso),
  }))

  const minPeso = Math.min(...chartData.map(d => d.peso))
  const maxPeso = Math.max(...chartData.map(d => d.peso))
  const padding = Math.max((maxPeso - minPeso) * 0.15, 0.5)

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">
        Evolucao do Peso
      </h3>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={chartData}>
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[minPeso - padding, maxPeso + padding]}
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            axisLine={false}
            tickLine={false}
            width={40}
          />
          <Tooltip
            contentStyle={{
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            }}
            formatter={(value) => [`${value} kg`, 'Peso']}
          />
          <Line
            type="monotone"
            dataKey="peso"
            stroke="#f43f5e"
            strokeWidth={2.5}
            dot={{ r: 4, fill: '#f43f5e', stroke: '#fff', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
