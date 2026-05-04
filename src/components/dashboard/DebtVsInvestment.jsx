import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { motion } from 'framer-motion'

export default function DebtVsInvestment() {
  const [amount, setAmount] = useState(5000)
  const [debtInterest, setDebtInterest] = useState(12)
  const [investmentReturn, setInvestmentReturn] = useState(8)
  const [years, setYears] = useState(10)
  const [data, setData] = useState([])

  useEffect(() => {
    calculateComparison()
  }, [amount, debtInterest, investmentReturn, years])

  const calculateComparison = () => {
    const newData = []
    let totalDebtCost = 0
    let totalInvestmentGain = 0

    // Juros Compostos para ambos
    const debtRate = debtInterest / 100
    const investRate = investmentReturn / 100

    for (let i = 1; i <= years; i++) {
      // Opção A: Pagar Dívida (O ganho é o juro que deixas de pagar)
      const debtSaved = amount * (Math.pow(1 + debtRate, i) - 1)
      
      // Opção B: Investir (O ganho é o juro que recebes)
      const investGained = amount * (Math.pow(1 + investRate, i) - 1)

      newData.push({
        year: `Ano ${i}`,
        'Poupança na Dívida': Math.round(debtSaved),
        'Ganho no Investimento': Math.round(investGained),
      })
    }
    setData(newData)
  }

  const formatCurrency = (val) => new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val)

  const isDebtBetter = debtInterest > investmentReturn

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl overflow-hidden relative">
         <div className="absolute top-0 right-0 p-8 opacity-5">
            <svg className="w-32 h-32 text-primary" fill="currentColor" viewBox="0 0 24 24">
               <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71L12 2z" />
            </svg>
         </div>

         <div className="relative z-10">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-2">Simulador Avançado</p>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Dívida vs Investimento</h2>
            <p className="text-slate-500 mt-2 max-w-xl">
               Deves amortizar o teu crédito ou investir o teu dinheiro extra? Este simulador compara o custo de oportunidade de ambas as decisões.
            </p>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-10">
            {/* Inputs */}
            <div className="space-y-6">
               <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Capital Disponível</label>
                  <input 
                    type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
               </div>
               <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Juro da Dívida (%)</label>
                  <input 
                    type="number" value={debtInterest} onChange={(e) => setDebtInterest(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
               </div>
               <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Retorno Invest. (%)</label>
                  <input 
                    type="number" value={investmentReturn} onChange={(e) => setInvestmentReturn(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
               </div>
               <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Anos</label>
                  <select 
                    value={years} onChange={(e) => setYears(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                     <option value={5}>5 Anos</option>
                     <option value={10}>10 Anos</option>
                     <option value={20}>20 Anos</option>
                  </select>
               </div>
            </div>

            {/* Results Chart */}
            <div className="lg:col-span-3 h-[350px] bg-slate-50 rounded-3xl p-6">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                     <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} />
                     <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} tickFormatter={(val) => `€${val}`} />
                     <Tooltip 
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                        cursor={{fill: '#f1f5f9'}}
                     />
                     <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }} />
                     <Bar dataKey="Poupança na Dívida" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                     <Bar dataKey="Ganho no Investimento" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
               </ResponsiveContainer>
            </div>
         </div>

         {/* Recommendation Footer */}
         <div className={`mt-8 p-6 rounded-2xl border-2 flex items-center gap-6 transition-all duration-500 ${isDebtBetter ? 'border-rose-100 bg-rose-50/50' : 'border-emerald-100 bg-emerald-50/50'}`}>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${isDebtBetter ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-white'}`}>
               {isDebtBetter ? '🛑' : '💸'}
            </div>
            <div>
               <h4 className={`text-sm font-black uppercase tracking-widest ${isDebtBetter ? 'text-rose-700' : 'text-emerald-700'}`}>
                  Recomendação Técnica: {isDebtBetter ? 'Pagar Dívida' : 'Investir Capital'}
               </h4>
               <p className="text-xs text-slate-600 mt-1 font-medium leading-relaxed">
                  {isDebtBetter 
                    ? `Com um juro de ${debtInterest}%, estás a "perder" mais dinheiro com o crédito do que ganharias no mercado (${investmentReturn}%). Amortiza já!`
                    : `O retorno de ${investmentReturn}% supera o custo da dívida (${debtInterest}%). Matematicamente, ganhas mais mantendo o crédito e investindo.`
                  }
               </p>
            </div>
         </div>
      </div>
    </div>
  )
}
