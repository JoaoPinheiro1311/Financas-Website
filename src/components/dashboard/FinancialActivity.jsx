import { useState, useEffect } from 'react'
import { apiFetch } from '../../config/api'
import { LoadingSpinner } from '../Skeleton'
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend,
  AreaChart, Area, XAxis, YAxis, CartesianGrid
} from 'recharts'

function FinancialActivity({ userData }) {
  const [data, setData] = useState({
    saldoAtual: 0,
    despesasMes: 0,
    receitasMes: 0,
    proximosPagamentos: [],
    despesasPorCategoria: [],
    ultimasTransacoes: [],
    evoluçãoSaldo: []
  })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all') // all, income, expense

  useEffect(() => {
    fetchActivitySummary()
  }, [])

  const fetchActivitySummary = async () => {
    try {
      setLoading(true)
      const response = await apiFetch('/api/activity-summary', {
        method: 'GET',
        credentials: 'include',
      })

      if (response.ok) {
        const summaryData = await response.json()

        // Simular evolução do saldo para o gráfico se não vier do backend
        const mockEvolucao = [
          { dia: '01', saldo: (summaryData.saldoAtual || 0) * 0.8 },
          { dia: '07', saldo: (summaryData.saldoAtual || 0) * 0.85 },
          { dia: '14', saldo: (summaryData.saldoAtual || 0) * 0.75 },
          { dia: '21', saldo: (summaryData.saldoAtual || 0) * 0.95 },
          { dia: 'Hoje', saldo: summaryData.saldoAtual || 0 }
        ]

        setData({
          saldoAtual: summaryData.saldoAtual || 0,
          despesasMes: summaryData.despesasMes || 0,
          receitasMes: summaryData.receitasMes || 0,
          proximosPagamentos: summaryData.proximosPagamentos || [],
          despesasPorCategoria: summaryData.despesasPorCategoria || [],
          ultimasTransacoes: summaryData.ultimasTransacoes || [],
          evoluçãoSaldo: summaryData.evoluçãoSaldo || mockEvolucao
        })
      } else {
        console.error('Erro ao buscar resumo da atividade')
      }
    } catch (err) {
      console.error('Erro ao buscar resumo da atividade:', err)
    } finally {
      // Pequeno delay para evitar flash
      setTimeout(() => setLoading(false), 300)
    }
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR'
    }).format(value)
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-PT', { day: 'numeric', month: 'long' })
  }

  const getDaysUntil = (dateString) => {
    const today = new Date()
    const target = new Date(dateString)
    return Math.ceil((target - today) / (1000 * 60 * 60 * 24))
  }

  const COLORS = ['#0F172A', '#3B82F6', '#10B981', '#F59E0B', '#64748B', '#94A3B8']

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">Resumo</p>
          <h2 className="text-2xl font-bold text-gray-900">Atividade Financeira</h2>
        </div>
      </div>

      {/* Cards Principais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="relative bg-slate-900 rounded-2xl p-6 text-white shadow-xl overflow-hidden group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-10 transform -translate-x-full group-hover:translate-x-full transition-all duration-1000"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white/90 text-sm font-semibold uppercase tracking-wide">Saldo Atual</h3>
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-4xl font-bold mb-2 tracking-tight">{formatCurrency(data.saldoAtual)}</p>
            <div className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${data.saldoAtual >= 0 ? 'bg-green-500/30 text-green-100' : 'bg-red-500/30 text-red-100'}`}>
              {data.saldoAtual >= 0 ? '✓ Positivo' : '⚠ Negativo'}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-700 text-sm font-semibold uppercase tracking-wide">Despesas</h3>
            <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center group-hover:bg-red-100 transition-colors">
              <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          <p className="text-4xl font-bold text-gray-900 mb-2">{formatCurrency(data.despesasMes)}</p>
          <p className="text-gray-500 text-sm font-medium">Este mês</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-700 text-sm font-semibold uppercase tracking-wide">Receitas</h3>
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center group-hover:bg-green-100 transition-colors">
              <svg className="w-7 h-7 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-4xl font-bold text-gray-900 mb-2">{formatCurrency(data.receitasMes)}</p>
          <p className="text-gray-500 text-sm font-medium">Este mês</p>
        </div>
      </div>

      {/* Gráfico de Evolução */}
      <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300">
        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center space-x-2">
          <div className="w-2 h-6 bg-primary rounded-full" />
          <span>Evolução do Saldo</span>
        </h3>
        <div className="h-[300px] w-full" style={{ minHeight: '300px' }}>
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <AreaChart data={data.evoluçãoSaldo}>
              <defs>
                <linearGradient id="colorSaldo" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis dataKey="dia" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} dy={10} />
              <YAxis hide domain={['auto', 'auto']} />
              <RechartsTooltip
                contentStyle={{ border: 'none', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', padding: '12px' }}
                formatter={(value) => [formatCurrency(value), 'Saldo']}
              />
              <Area type="monotone" dataKey="saldo" stroke="#3B82F6" strokeWidth={4} fillOpacity={1} fill="url(#colorSaldo)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Despesas por Categoria (Pie) */}
        <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300">
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center space-x-2">
            <div className="w-2 h-6 bg-primary rounded-full" />
            <span>Despesas por Categoria</span>
          </h3>
          <div className="h-[300px] w-full" style={{ minHeight: '300px' }}>
            {data.despesasPorCategoria.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <PieChart>
                  <Pie
                    data={data.despesasPorCategoria}
                    innerRadius={80}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="valor"
                    nameKey="categoria"
                  >
                    {data.despesasPorCategoria.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    contentStyle={{ border: 'none', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}
                    formatter={(value) => formatCurrency(value)}
                  />
                  <Legend iconType="circle" verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <p>Nenhuma despesa registada</p>
              </div>
            )}
          </div>
        </div>

        {/* Últimas Transações */}
        <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 overflow-hidden">
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center space-x-2">
            <div className="w-2 h-6 bg-primary rounded-full" />
            <span>Transações Recentes</span>
          </h3>
          
          {/* Filter Bar */}
          <div className="mb-4 flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <input 
                type="text" 
                placeholder="Pesquisar..." 
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <svg className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <select 
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">Todas</option>
              <option value="income">Receitas</option>
              <option value="expense">Despesas</option>
            </select>
          </div>

          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {data.ultimasTransacoes
              .filter(t => {
                const matchesSearch = t.descricao.toLowerCase().includes(searchTerm.toLowerCase())
                const matchesType = filterType === 'all' || t.tipo === filterType
                return matchesSearch && matchesType
              })
              .map((transacao) => (
                <div key={transacao.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${transacao.tipo === 'receita' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                      {transacao.tipo === 'receita' ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-gray-900">{transacao.descricao}</p>
                      <p className="text-xs text-gray-500">{formatDate(transacao.data)}</p>
                    </div>
                  </div>
                  <p className={`font-bold ${transacao.tipo === 'receita' ? 'text-green-600' : 'text-red-600'}`}>
                    {transacao.tipo === 'receita' ? '+' : '-'}{formatCurrency(Math.abs(transacao.valor))}
                  </p>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default FinancialActivity
