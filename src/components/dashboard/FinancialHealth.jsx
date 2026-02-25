import { useState, useEffect } from 'react'
import { apiFetch } from '../../config/api'
import { useToast } from '../Toast'
import { LoadingSpinner } from '../Skeleton'

function FinancialHealth({ userData }) {
  const { showToast } = useToast()
  const [healthScore, setHealthScore] = useState(0)
  const [metrics, setMetrics] = useState({
    rendaMensal: 0,
    despesasMensais: 0,
    poupancaMensal: 0,
    fundoEmergencia: 0,
    dividas: 0,
    investimentos: 0,
  })
  const [taxaPoupanca, setTaxaPoupanca] = useState(0)
  const [mesesFundoEmergencia, setMesesFundoEmergencia] = useState(0)
  const [taxaEndividamento, setTaxaEndividamento] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchFinancialHealth()
  }, [userData])

  const fetchFinancialHealth = async () => {
    if (!userData?.user_id) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await apiFetch('/api/financial-health', {
        method: 'GET',
        credentials: 'include',
      })

      if (response.ok) {
        const data = await response.json()
        setHealthScore(data.healthScore || 0)
        setMetrics(data.metrics || {})
        setTaxaPoupanca(data.taxaPoupanca || 0)
        setMesesFundoEmergencia(data.mesesFundoEmergencia || 0)
        setTaxaEndividamento(data.taxaEndividamento || 0)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Erro ao carregar saúde financeira.')
        showToast('Erro ao carregar dados de saúde financeira', 'error')
      }
    } catch (err) {
      console.error('Error fetching financial health:', err)
      setError('Erro de rede ou servidor.')
      showToast('Erro ao carregar dados de saúde financeira', 'error')
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

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBgColor = (score) => {
    if (score >= 80) return 'bg-green-100'
    if (score >= 60) return 'bg-yellow-100'
    return 'bg-red-100'
  }

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Excelente'
    if (score >= 60) return 'Bom'
    return 'Precisa Melhorar'
  }

  if (loading) {
    return <LoadingSpinner />
  }

  if (error) {
    return (
      <div className="text-red-500 text-center p-4">
        {error}
        <button
          onClick={fetchFinancialHealth}
          className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
        >
          Tentar Novamente
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">Saúde</p>
          <h2 className="text-2xl font-bold text-gray-900">Análise e Saúde Financeira</h2>
        </div>
        <button
          onClick={fetchFinancialHealth}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold transition-all duration-200 flex items-center space-x-2 border border-slate-200"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Atualizar</span>
        </button>
      </div>

      {/* Score Card - Refined with professional colors */}
      <div className="relative bg-slate-900 rounded-2xl p-8 text-white shadow-xl overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-transparent opacity-50"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex-1">
            <h3 className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-2 flex items-center space-x-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>Score de Saúde Financeira</span>
            </h3>
            <div className="flex items-baseline space-x-2 mb-3">
              <p className="text-7xl font-bold tracking-tight">{healthScore}</p>
              <p className="text-2xl text-slate-500 font-medium">/100</p>
            </div>
            <div className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg border font-bold text-sm ${getScoreLabel(healthScore) === 'Excelente' ? 'border-green-500/30 bg-green-500/10 text-green-400' :
              getScoreLabel(healthScore) === 'Bom' ? 'border-yellow-500/30 bg-yellow-500/10 text-yellow-400' :
                'border-red-500/30 bg-red-500/10 text-red-400'
              }`}>
              <span>{getScoreLabel(healthScore)}</span>
            </div>
          </div>

          {/* Circular progress - Cleaner implementation */}
          <div className="relative w-36 h-36">
            <svg className="transform -rotate-90 w-36 h-36">
              <circle
                cx="72"
                cy="72"
                r="64"
                stroke="rgba(255,255,255,0.05)"
                strokeWidth="8"
                fill="none"
              />
              <circle
                cx="72"
                cy="72"
                r="64"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 64}`}
                strokeDashoffset={`${2 * Math.PI * 64 * (1 - healthScore / 100)}`}
                strokeLinecap="round"
                className={`transition-all duration-1000 ease-out ${healthScore >= 80 ? 'text-green-500' :
                  healthScore >= 60 ? 'text-yellow-500' : 'text-red-500'
                  }`}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-3xl font-bold">{healthScore}</span>
            </div>
          </div>
        </div>

        {/* Progress bar simplified */}
        <div className="relative z-10 mt-8">
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className={`rounded-full h-2 transition-all duration-1000 ease-out ${healthScore >= 80 ? 'bg-green-500' :
                healthScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
              style={{ width: `${healthScore}%` }}
            ></div>
          </div>
          <div className="flex justify-between mt-3 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
            <span>Péssimo</span>
            <span>Regular</span>
            <span>Bom</span>
            <span>Excelente</span>
          </div>
        </div>
      </div>

      {/* Main Metrics - Cleaner cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Taxa de Poupança */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Taxa de Poupança</h3>
            <div className="w-10 h-10 bg-slate-50 text-slate-400 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="mb-4">
            <p className="text-4xl font-bold text-slate-900 mb-1">{taxaPoupanca.toFixed(1)}%</p>
            <p className="text-sm text-slate-500 font-medium">Poupança: <span className="text-slate-900">{formatCurrency(metrics.poupancaMensal)}</span>/mês</p>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-primary rounded-full h-2.5 transition-all duration-700 ease-out"
              style={{ width: `${Math.min(parseFloat(taxaPoupanca), 100)}%` }}
            ></div>
          </div>
          <div className="flex justify-between items-center mt-3">
            <p className="text-xs text-slate-400 font-semibold">Meta: 20%</p>
            {taxaPoupanca >= 20 && (
              <span className="text-[10px] bg-green-50 text-green-600 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">Ideal</span>
            )}
          </div>
        </div>

        {/* Dinheiro de Parte */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Reserva de Emergência</h3>
            <div className="w-10 h-10 bg-slate-50 text-slate-400 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
          <div className="mb-4">
            <p className="text-4xl font-bold text-slate-900 mb-1">{formatCurrency(metrics.fundoEmergencia)}</p>
            <p className="text-sm text-slate-500 font-medium">Equivale a <span className="text-slate-900">{mesesFundoEmergencia.toFixed(1)}</span> meses</p>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-primary rounded-full h-2.5 transition-all duration-700 ease-out"
              style={{ width: `${Math.min((parseFloat(mesesFundoEmergencia) / 6) * 100, 100)}%` }}
            ></div>
          </div>
          <div className="flex justify-between items-center mt-3">
            <p className="text-xs text-slate-400 font-semibold">Meta: 6 meses</p>
            {mesesFundoEmergencia >= 6 && (
              <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">Seguro</span>
            )}
          </div>
        </div>

        {/* Taxa de Endividamento */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Endividamento</h3>
            <div className="w-10 h-10 bg-slate-50 text-slate-400 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="mb-4">
            <p className="text-4xl font-bold text-slate-900 mb-1">{taxaEndividamento.toFixed(1)}%</p>
            <p className="text-sm text-slate-500 font-medium">Dívidas: <span className="text-slate-900">{formatCurrency(metrics.dividas)}</span></p>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div
              className={`rounded-full h-2.5 transition-all duration-700 ease-out ${taxaEndividamento > 30 ? 'bg-red-500' :
                taxaEndividamento > 20 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
              style={{ width: `${Math.min(parseFloat(taxaEndividamento), 100)}%` }}
            ></div>
          </div>
          <div className="flex justify-between items-center mt-3">
            <p className="text-xs text-slate-400 font-semibold">Limite: 30%</p>
            <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider ${taxaEndividamento <= 30 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
              }`}>
              {taxaEndividamento <= 30 ? 'Saudável' : 'Alto'}
            </span>
          </div>
        </div>
      </div>

      {/* Detailed Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Receitas vs Despesas */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center space-x-2">
            <div className="w-1.5 h-6 bg-primary rounded-full"></div>
            <span>Receitas vs Despesas</span>
          </h3>
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-slate-600">Receitas Mensais</span>
                <span className="text-sm font-bold text-slate-900">{formatCurrency(metrics.rendaMensal)}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div className="bg-primary rounded-full h-2" style={{ width: '100%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-slate-600">Despesas Mensais</span>
                <span className="text-sm font-bold text-slate-900">{formatCurrency(metrics.despesasMensais)}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-slate-400 rounded-full h-2"
                  style={{ width: `${metrics.rendaMensal > 0 ? (metrics.despesasMensais / metrics.rendaMensal) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
            <div className="pt-6 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Saldo Mensal</span>
                  <span className="text-2xl font-bold text-slate-900">{formatCurrency(metrics.poupancaMensal)}</span>
                </div>
                <div className={`p-2 rounded-lg ${metrics.poupancaMensal >= 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                  {metrics.poupancaMensal >= 0 ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recomendations */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center space-x-2">
            <div className="w-1.5 h-6 bg-primary rounded-full"></div>
            <span>Recomendações Práticas</span>
          </h3>
          <div className="space-y-4 max-h-[320px] overflow-y-auto pr-2 custom-scrollbar">
            {parseFloat(taxaPoupanca) >= 20 && parseFloat(mesesFundoEmergencia) >= 6 && parseFloat(taxaEndividamento) <= 20 ? (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-sm font-bold text-slate-900 mb-1">✓ Desempenho Excecional</p>
                <p className="text-xs text-slate-500 leading-relaxed">As suas finanças estão sólidas e seguem as melhores práticas do mercado. Continue com este rigor.</p>
              </div>
            ) : null}

            {parseFloat(taxaPoupanca) < 20 && (
              <div className="p-4 bg-slate-50 border-l-4 border-primary rounded-r-xl">
                <p className="text-sm font-bold text-slate-900 mb-1">Aumentar Taxa de Poupança</p>
                <p className="text-xs text-slate-500 leading-relaxed">Tente atingir a meta dos 20%. Para isso, pondere automatizar uma transferência logo no dia em que recebe o salário.</p>
              </div>
            )}

            {parseFloat(mesesFundoEmergencia) < 6 && (
              <div className="p-4 bg-slate-50 border-l-4 border-primary rounded-r-xl">
                <p className="text-sm font-bold text-slate-900 mb-1">Reforçar Reserva de Emergência</p>
                <p className="text-xs text-slate-500 leading-relaxed">A sua reserva cobre {mesesFundoEmergencia.toFixed(1)} meses. O ideal são 6 meses para garantir total paz de espírito em imprevistos.</p>
              </div>
            )}

            {parseFloat(taxaEndividamento) > 30 && (
              <div className="p-4 bg-slate-50 border-l-4 border-red-500 rounded-r-xl">
                <p className="text-sm font-bold text-slate-900 mb-1">Reduzir Endividamento</p>
                <p className="text-xs text-slate-500 leading-relaxed">A taxa de {taxaEndividamento.toFixed(1)}% é superior ao limite prudencial. Priorize o pagamento de créditos com taxas de juro elevadas.</p>
              </div>
            )}

            {metrics.investimentos > 0 ? (
              <div className="p-4 bg-slate-50 border-l-4 border-slate-900 rounded-r-xl">
                <p className="text-sm font-bold text-slate-900 mb-1">Gestão de Investimentos</p>
                <p className="text-xs text-slate-500 leading-relaxed">Tem um capital investido de {formatCurrency(metrics.investimentos)}. Recomendamos a revisão trimestral do portfólio para reequilíbrio.</p>
              </div>
            ) : (
              <div className="p-4 bg-slate-50 border-l-4 border-slate-900 rounded-r-xl">
                <p className="text-sm font-bold text-slate-900 mb-1">Considerar Investimentos</p>
                <p className="text-xs text-slate-500 leading-relaxed">Com a sua poupança atual, pode começar a explorar o mercado de capitais para combater a inflação e gerar riqueza a longo prazo.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default FinancialHealth

