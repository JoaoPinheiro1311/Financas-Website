import { useState, useEffect } from 'react'
import { apiFetch } from '../../config/api'
import { LoadingSpinner } from '../Skeleton'
import { motion, AnimatePresence } from 'framer-motion'

function SmartInsights({ userData, onOpenChat }) {
  const [insights, setInsights] = useState([])
  const [loading, setLoading] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)

  const fetchSmartInsights = async () => {
    try {
      setLoading(true)
      const resp = await apiFetch('/api/summary/insights')
      if (resp.ok) {
        const data = await resp.json()
        setInsights(data.insights || [])
        setHasLoaded(true)
      }
    } catch (e) {
      console.error('Insights Fetch Error:', e)
    } finally {
      setLoading(false)
    }
  }

  const roadmap = [
    { target: 'Fundo de Emergência', progress: 85, date: 'Maio 2026', icon: '🛡️' },
    { target: 'Liberdade Financeira #1', progress: 12, date: '2034', icon: '🚀' },
    { target: 'Reforma Antecipada', progress: 5, date: '2045', icon: '🏝️' },
  ]

  if (loading) return <LoadingSpinner />

  // Mostrar botão de gerar se ainda não carregou
  if (!hasLoaded && !loading) return (
    <div className="space-y-10 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-2">Motor de Inteligência Preditiva</p>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-none">Smart Insights &amp; Projeções</h2>
          <p className="text-slate-500 mt-4 text-lg leading-relaxed">Análise preditiva com IA baseada nos teus dados financeiros reais.</p>
        </div>
      </div>
      <div className="bg-white rounded-2xl p-12 border border-gray-100 shadow-sm text-center">
        <div className="text-5xl mb-4">🧘‍♂️</div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">Pronto para analisar as tuas finanças?</h3>
        <p className="text-slate-500 mb-6">A análise usa inteligência artificial para gerar insights personalizados com base nos teus dados.</p>
        <button onClick={fetchSmartInsights}
          className="bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-primary/20">
          ✨ Gerar Insights com IA
        </button>
      </div>
    </div>
  )

  return (
    <div className="space-y-10 pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="max-w-2xl">
          <motion.p 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-2"
          >
            Motor de Inteligência Preditiva
          </motion.p>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-black text-slate-900 tracking-tight leading-none"
          >
            Smart Insights & Projeções
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-slate-500 mt-4 text-lg leading-relaxed"
          >
            Cruzamos os teus padrões de despesa com as tendências de mercado para calcular o teu futuro financeiro com precisão algorítmica.
          </motion.p>
        </div>
        <div className="bg-emerald-50 border border-emerald-100 px-6 py-4 rounded-2xl flex items-center gap-4">
          <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-emerald-700 font-bold text-sm uppercase tracking-wider">Análise em Tempo Real</span>
        </div>
      </div>

      {/* Main Grid: Insights Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <AnimatePresence>
          {insights.map((insight, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.15, type: 'spring', stiffness: 100 }}
              className="relative group h-full"
            >
              <div className="absolute inset-0 bg-primary/5 rounded-[2.5rem] blur-2xl group-hover:bg-primary/10 transition-all duration-500" />
              <div className="relative bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-100 hover:border-primary/20 transition-all h-full flex flex-col">
                <div className="mb-6 flex items-start justify-between">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.15em]">{insight.title}</h3>
                  <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-xl group-hover:bg-primary/10 group-hover:scale-110 transition-all">
                    {i === 0 ? '📅' : i === 1 ? '📈' : '🔓'}
                  </div>
                </div>
                <p className="text-4xl font-black text-slate-900 mb-4 tracking-tighter">{insight.value}</p>
                <p className="text-slate-500 text-sm leading-relaxed font-medium">{insight.desc}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Bottom Layout: Roadmap & Sensei */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Roadmap (3/5) */}
        <div className="lg:col-span-3 bg-white rounded-[2.5rem] p-10 shadow-xl border border-slate-100">
          <h3 className="text-xl font-bold text-slate-900 mb-8 flex items-center gap-3">
            <span className="p-2 bg-slate-900 text-white rounded-lg text-sm">📍</span>
            Financial Roadmap 2026-2045
          </h3>
          <div className="space-y-8">
            {roadmap.map((item, i) => (
              <div key={i} className="relative">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-slate-700 flex items-center gap-2 text-sm">
                    <span className="text-lg">{item.icon}</span> {item.target}
                  </span>
                  <span className="text-xs font-black text-slate-400">{item.date}</span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${item.progress}%` }}
                    transition={{ duration: 1, delay: 0.5 + i * 0.2 }}
                    className="h-full bg-gradient-to-r from-primary to-blue-400 rounded-full shadow-lg"
                  />
                </div>
                <p className="text-right text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">
                  {item.progress}% Concluído
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Sensei Wisdom (2/5) */}
        <div className="lg:col-span-2 glass-dark rounded-[2.5rem] p-10 text-white flex flex-col justify-between relative overflow-hidden group border border-white/5 shadow-2xl">
          <div className="absolute -right-10 -bottom-10 opacity-20 transform scale-150 rotate-12 group-hover:scale-125 transition-transform duration-1000">
            <svg className="w-64 h-64 text-primary" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71L12 2z" />
            </svg>
          </div>
          <div className="relative z-10">
            <div className="w-16 h-1.5 bg-gradient-to-r from-primary to-emerald-400 mb-8 rounded-full" />
            <h3 className="text-sm font-black text-slate-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
              Mestria Financeira
            </h3>
            <p className="text-white text-2xl font-bold leading-tight tracking-tight">
              "O tempo é o melhor amigo dos juros compostos. Cada euro poupado hoje é um soldado que lutará pela tua liberdade amanhã."
            </p>
          </div>
          <div className="relative z-10 mt-10">
            <button 
              onClick={() => {
                if (onOpenChat) onOpenChat()
                else {
                  // Abrir chatbot via DOM se disponível
                  const chatBtn = document.querySelector('[title="Assistente Financeiro"]')
                  if (chatBtn) chatBtn.click()
                }
              }}
              className="px-6 py-3 bg-primary hover:bg-primary-dark rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-primary/20">
              💬 Falar com o Sensei
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SmartInsights
