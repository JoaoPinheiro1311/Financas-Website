import { useState, useEffect } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { motion } from 'framer-motion'

export default function CompoundSimulator() {
  const [initialAmount, setInitialAmount] = useState(1000)
  const [monthlyContribution, setMonthlyContribution] = useState(100)
  const [years, setYears] = useState(20)
  const [interestRate, setInterestRate] = useState(8)
  const [data, setData] = useState([])

  useEffect(() => {
    calculateCompoundInterest()
  }, [initialAmount, monthlyContribution, years, interestRate])

  const calculateCompoundInterest = () => {
    const newData = []
    let total = initialAmount
    const ratePerMonth = interestRate / 100 / 12

    for (let i = 0; i <= years; i++) {
      newData.push({
        year: i,
        total: Math.round(total),
        invested: Math.round(initialAmount + (monthlyContribution * 12 * i)),
      })

      // Calculate for next year
      for (let m = 0; m < 12; m++) {
        total = (total + monthlyContribution) * (1 + ratePerMonth)
      }
    }
    setData(newData)
  }

  const formatCurrency = (val) => new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val)

  return (
    <div className="space-y-8 pb-12">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">Simuladores</p>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Juros Compostos</h2>
        <p className="text-slate-500 text-sm mt-1">Visualize o poder do tempo e dos juros no seu património.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Controls */}
        <div className="glass-card p-6 space-y-6">
          <div>
            <label className="flex justify-between text-sm font-bold text-slate-700 mb-2">
              <span>Investimento Inicial</span>
              <span className="text-primary">{formatCurrency(initialAmount)}</span>
            </label>
            <input 
              type="range" min="0" max="50000" step="500"
              value={initialAmount} onChange={(e) => setInitialAmount(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
            />
          </div>

          <div>
            <label className="flex justify-between text-sm font-bold text-slate-700 mb-2">
              <span>Contribuição Mensal</span>
              <span className="text-primary">{formatCurrency(monthlyContribution)}</span>
            </label>
            <input 
              type="range" min="0" max="5000" step="50"
              value={monthlyContribution} onChange={(e) => setMonthlyContribution(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
            />
          </div>

          <div>
            <label className="flex justify-between text-sm font-bold text-slate-700 mb-2">
              <span>Período (Anos)</span>
              <span className="text-primary">{years} anos</span>
            </label>
            <input 
              type="range" min="1" max="50"
              value={years} onChange={(e) => setYears(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
            />
          </div>

          <div>
            <label className="flex justify-between text-sm font-bold text-slate-700 mb-2">
              <span>Taxa de Juro Anual (%)</span>
              <span className="text-primary">{interestRate}%</span>
            </label>
            <input 
              type="range" min="1" max="25" step="0.5"
              value={interestRate} onChange={(e) => setInterestRate(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
            />
          </div>

          <div className="pt-4 border-t border-slate-100">
             <div className="bg-slate-900 rounded-xl p-4 text-white">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Montante Final</p>
                <p className="text-3xl font-black text-emerald-400">{formatCurrency(data[data.length - 1]?.total || 0)}</p>
                <p className="text-[10px] text-slate-400 mt-2 font-medium">
                  Total Investido: <span className="text-slate-200">{formatCurrency(data[data.length - 1]?.invested || 0)}</span>
                </p>
             </div>
          </div>
        </div>

        {/* Chart */}
        <div className="lg:col-span-2 glass-card p-6 flex flex-col min-h-[400px]">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-slate-900">Projeção de Crescimento</h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-primary rounded-full" />
                <span className="text-[10px] font-bold text-slate-500 uppercase">Total</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-slate-300 rounded-full" />
                <span className="text-[10px] font-bold text-slate-500 uppercase">Investido</span>
              </div>
            </div>
          </div>

          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="year" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                  tickFormatter={(val) => `€${val/1000}k`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                    border: 'none', 
                    borderRadius: '12px',
                    color: '#fff',
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'
                  }}
                  itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="total" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorTotal)" 
                  animationDuration={1500}
                />
                <Area 
                  type="monotone" 
                  dataKey="invested" 
                  stroke="#cbd5e1" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  fill="transparent"
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
