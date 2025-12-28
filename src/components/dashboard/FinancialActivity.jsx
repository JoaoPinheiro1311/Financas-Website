import { useState, useEffect } from 'react'

function FinancialActivity({ userData }) {
  const [data, setData] = useState({
    saldoAtual: 0,
    despesasMes: 0,
    receitasMes: 0,
    proximosPagamentos: [],
    despesasPorCategoria: [],
    ultimasTransacoes: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchActivitySummary()
  }, [])

  const fetchActivitySummary = async () => {
    try {
      setLoading(true)
      const response = await fetch('http://localhost:5000/api/activity-summary', {
        method: 'GET',
        credentials: 'include',
      })

      if (response.ok) {
        const summaryData = await response.json()
        setData({
          saldoAtual: summaryData.saldoAtual || 0,
          despesasMes: summaryData.despesasMes || 0,
          receitasMes: summaryData.receitasMes || 0,
          proximosPagamentos: summaryData.proximosPagamentos || [],
          despesasPorCategoria: summaryData.despesasPorCategoria || [],
          ultimasTransacoes: summaryData.ultimasTransacoes || []
        })
      } else {
        console.error('Erro ao buscar resumo da atividade')
      }
    } catch (err) {
      console.error('Erro ao buscar resumo da atividade:', err)
    } finally {
      setLoading(false)
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
    const diff = Math.ceil((target - today) / (1000 * 60 * 60 * 24))
    return diff
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">A carregar dados...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary/80">Resumo</p>
          <h2 className="text-2xl font-bold text-gray-900">Atividade Financeira</h2>
        </div>
      </div>

      {/* Cards Principais com animação */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Saldo Atual - Gradiente melhorado */}
        <div className="relative bg-gradient-to-br from-blue-600 via-primary to-purple-600 rounded-2xl p-6 text-white shadow-xl overflow-hidden group hover:shadow-2xl transition-all duration-300">
          {/* Efeito de brilho animado */}
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
            <div className="flex items-center space-x-2">
              <div className={`px-3 py-1 rounded-full text-xs font-semibold ${data.saldoAtual >= 0 ? 'bg-green-500/30 text-green-100' : 'bg-red-500/30 text-red-100'}`}>
                {data.saldoAtual >= 0 ? '✓ Positivo' : '⚠ Negativo'}
              </div>
            </div>
          </div>
        </div>

        {/* Despesas do Mês - Card melhorado */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-red-100 hover:border-red-200 transition-all duration-300 hover:shadow-xl group">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-700 text-sm font-semibold uppercase tracking-wide">Despesas do Mês</h3>
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          <p className="text-4xl font-bold text-gray-900 mb-2">{formatCurrency(data.despesasMes)}</p>
          <p className="text-gray-500 text-sm flex items-center space-x-1">
            <span className="font-medium">Receitas:</span>
            <span className="text-gray-700 font-semibold">{formatCurrency(data.receitasMes)}</span>
          </p>
        </div>

        {/* Receitas do Mês - Card melhorado */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-green-100 hover:border-green-200 transition-all duration-300 hover:shadow-xl group">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-700 text-sm font-semibold uppercase tracking-wide">Receitas do Mês</h3>
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-110 group-hover:-rotate-6 transition-all duration-300">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-4xl font-bold text-gray-900 mb-2">{formatCurrency(data.receitasMes)}</p>
          <div className="flex items-center space-x-2">
            <div className={`px-3 py-1 rounded-full text-xs font-semibold ${data.saldoAtual >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {data.saldoAtual >= 0 ? '📈 Superavit' : '📉 Deficit'}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Próximos Pagamentos - Design melhorado */}
        <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
              <span className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
              <span>Próximos Pagamentos</span>
            </h2>
            {data.proximosPagamentos.length > 0 && (
              <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded-full">
                {data.proximosPagamentos.length} {data.proximosPagamentos.length === 1 ? 'pendente' : 'pendentes'}
              </span>
            )}
          </div>
          {data.proximosPagamentos.length > 0 ? (
            <div className="space-y-3">
              {data.proximosPagamentos.map((pagamento) => {
                const daysUntil = getDaysUntil(pagamento.data)
                const isUrgent = daysUntil <= 3
                const isWarning = daysUntil <= 7 && daysUntil > 3
                return (
                  <div key={pagamento.id} className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-300 hover:scale-[1.02] cursor-pointer ${
                    isUrgent ? 'bg-red-50 border-red-200 hover:border-red-300' : 
                    isWarning ? 'bg-orange-50 border-orange-200 hover:border-orange-300' : 
                    'bg-gray-50 border-gray-200 hover:border-primary'
                  }`}>
                    <div className="flex items-center space-x-3 flex-1">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        isUrgent ? 'bg-red-200' : isWarning ? 'bg-orange-200' : 'bg-blue-100'
                      }`}>
                        <svg className={`w-6 h-6 ${isUrgent ? 'text-red-700' : isWarning ? 'text-orange-700' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{pagamento.descricao}</p>
                        <p className="text-sm text-gray-600">{pagamento.categoria} • {formatDate(pagamento.data)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg text-gray-900">{formatCurrency(pagamento.valor)}</p>
                      <p className={`text-xs font-semibold px-2 py-1 rounded-full inline-block mt-1 ${
                        daysUntil <= 0 ? 'bg-red-200 text-red-800' : 
                        daysUntil <= 3 ? 'bg-red-100 text-red-700' : 
                        daysUntil <= 7 ? 'bg-orange-100 text-orange-700' : 
                        'bg-gray-200 text-gray-700'
                      }`}>
                        {daysUntil === 0 ? '🔴 Hoje' : daysUntil === 1 ? '⚠️ Amanhã' : daysUntil < 0 ? '❌ Vencido' : `📅 ${daysUntil}d`}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-gray-500 font-medium">Sem pagamentos pendentes</p>
              <p className="text-sm text-gray-400 mt-1">Você está em dia! 🎉</p>
            </div>
          )}
        </div>

        {/* Despesas por Categoria - Design melhorado */}
        <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
              <span className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </span>
              <span>Por Categoria</span>
            </h2>
          </div>
          {data.despesasPorCategoria.length > 0 ? (
            <div className="space-y-4">
              {data.despesasPorCategoria.map((item, index) => {
                const colors = [
                  'from-blue-500 to-blue-600',
                  'from-purple-500 to-purple-600',
                  'from-pink-500 to-pink-600',
                  'from-orange-500 to-orange-600',
                  'from-green-500 to-green-600',
                ]
                const color = colors[index % colors.length]
                return (
                  <div key={index} className="group">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-700">{item.categoria}</span>
                      <div className="text-right">
                        <span className="text-sm font-bold text-gray-900">{formatCurrency(item.valor)}</span>
                        <span className="text-xs text-gray-500 ml-2">({item.percentagem}%)</span>
                      </div>
                    </div>
                    <div className="relative w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div
                        className={`bg-gradient-to-r ${color} rounded-full h-3 transition-all duration-500 ease-out shadow-sm group-hover:shadow-md`}
                        style={{ width: `${Math.min(item.percentagem, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <p className="text-gray-500 font-medium">Sem despesas registadas</p>
              <p className="text-sm text-gray-400 mt-1">Comece a registar suas despesas</p>
            </div>
          )}
        </div>
      </div>

      {/* Últimas Transações - Design melhorado */}
      <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
            <span className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </span>
            <span>Últimas Transações</span>
          </h2>
        </div>
        {data.ultimasTransacoes.length > 0 ? (
          <div className="space-y-3">
            {data.ultimasTransacoes.map((transacao) => (
              <div key={transacao.id} className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-300 hover:scale-[1.01] cursor-pointer ${
                transacao.tipo === 'receita' ? 'bg-green-50 border-green-200 hover:border-green-300' : 'bg-red-50 border-red-200 hover:border-red-300'
              }`}>
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${
                    transacao.tipo === 'receita' ? 'bg-gradient-to-br from-green-500 to-green-600' : 'bg-gradient-to-br from-red-500 to-red-600'
                  }`}>
                    {transacao.tipo === 'receita' ? (
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                      </svg>
                    ) : (
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{transacao.descricao}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-sm text-gray-600">{formatDate(transacao.data)}</span>
                      <span className="text-gray-400">•</span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        transacao.tipo === 'receita' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {transacao.tipo === 'receita' ? 'Receita' : 'Despesa'}
                      </span>
                    </div>
                  </div>
                </div>
                <p className={`text-xl font-bold ${transacao.tipo === 'receita' ? 'text-green-600' : 'text-red-600'}`}>
                  {transacao.tipo === 'receita' ? '+' : '-'}{formatCurrency(Math.abs(transacao.valor))}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <p className="text-gray-600 font-semibold text-lg">Sem transações registadas</p>
            <p className="text-sm text-gray-500 mt-2">Adicione sua primeira transação na aba "Adicionar Transação"</p>
            <button className="mt-4 px-6 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors">
              Adicionar Transação
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default FinancialActivity
