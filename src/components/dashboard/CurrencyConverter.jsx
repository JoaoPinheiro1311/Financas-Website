import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

export default function CurrencyConverter() {
  const [amount, setAmount] = useState(100)
  const [fromCurrency, setFromCurrency] = useState('EUR')
  const [toCurrency, setToCurrency] = useState('USD')
  const [rates, setRates] = useState({})
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState('')

  const currencies = ['EUR', 'USD', 'GBP', 'BRL', 'JPY', 'CAD', 'CHF']

  useEffect(() => {
    fetchRates()
  }, [fromCurrency])

  const fetchRates = async () => {
    try {
      setLoading(true)
      const resp = await fetch(`https://open.er-api.com/v6/latest/${fromCurrency}`)
      const data = await resp.json()
      if (data.result === 'success') {
        setRates(data.rates)
        setLastUpdate(new Date(data.time_last_update_utc).toLocaleString('pt-PT'))
      }
    } catch (e) {
      console.error('Rates Fetch Error:', e)
    } finally {
      setLoading(false)
    }
  }

  const convertedAmount = rates[toCurrency] ? (amount * rates[toCurrency]).toFixed(2) : '...'

  return (
    <div className="animate-fade-in">
      <div className="glass-card p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-6 opacity-5">
           <svg className="w-24 h-24 text-primary" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71L12 2z" />
           </svg>
        </div>

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-1">Mercado Cambial</p>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Conversor de Moedas</h3>
            </div>
            <div className="text-right">
               <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-600 border border-emerald-100 uppercase tracking-widest">
                 Live API
               </span>
               <p className="text-[9px] text-slate-400 mt-1 font-bold">Ref: {lastUpdate}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-7 items-center gap-4">
            {/* Input Amount */}
            <div className="md:col-span-3">
               <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Valor a Converter</label>
               <div className="relative">
                  <input 
                    type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 font-black text-slate-900 text-xl focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all"
                  />
                  <select 
                    value={fromCurrency} onChange={(e) => setFromCurrency(e.target.value)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-black text-slate-700 shadow-sm outline-none"
                  >
                    {currencies.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
               </div>
            </div>

            {/* Swap Icon */}
            <div className="flex justify-center">
               <button 
                onClick={() => {setFromCurrency(toCurrency); setToCurrency(fromCurrency)}}
                className="w-12 h-12 bg-slate-900 text-white rounded-full flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-lg"
               >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
               </button>
            </div>

            {/* Result Amount */}
            <div className="md:col-span-3">
               <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Resultado Estimado</label>
               <div className="relative">
                  <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-5 py-4 font-black text-emerald-400 text-xl flex items-center shadow-2xl">
                    {loading ? '...' : convertedAmount}
                  </div>
                  <select 
                    value={toCurrency} onChange={(e) => setToCurrency(e.target.value)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-black text-slate-300 shadow-sm outline-none"
                  >
                    {currencies.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
               </div>
            </div>
          </div>

          <div className="mt-8 flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
             <div className="w-8 h-8 bg-blue-500/10 text-blue-500 rounded-lg flex items-center justify-center text-lg">ℹ️</div>
             <p className="text-xs text-slate-500 font-medium leading-relaxed">
               As taxas de câmbio são fornecidas pela <span className="font-bold text-slate-700">ExchangeRate-API</span> e são atualizadas periodicamente. O valor final pode variar em instituições bancárias reais.
             </p>
          </div>
        </div>
      </div>
    </div>
  )
}
