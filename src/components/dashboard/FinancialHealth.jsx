import { useState, useEffect } from 'react'
import { apiFetch, API_BASE_URL } from '../../config/api'
import { useToast } from '../Toast'

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
      setLoading(false)
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
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
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
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary/80">Saúde</p>
          <h2 className="text-2xl font-bold text-gray-900">Análise e Saúde Financeira</h2>
        </div>
        <button
          onClick={fetchFinancialHealth}
          className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg font-semibold transition-all duration-200 flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Atualizar</span>
        </button>
      </div>

      {/* Score Card - Redesenhado com animação */}
      <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 rounded-3xl p-8 text-white shadow-2xl overflow-hidden group">
        {/* Padrão de fundo animado */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full bg-white"
                style={{
                  width: `${Math.random() * 100 + 50}px`,
                  height: `${Math.random() * 100 + 50}px`,
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  animation: `float ${5 + Math.random() * 10}s ease-in-out infinite`,
                  animationDelay: `${Math.random() * 5}s`,
                }}
              />
            ))}
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between">
          <div className="flex-1">
            <h3 className="text-white/90 text-sm font-semibold uppercase tracking-wider mb-3 flex items-center space-x-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>Score de Saúde Financeira</span>
            </h3>
            <p className="text-6xl font-black mb-3 tracking-tight">{healthScore}<span className="text-3xl text-white/80">/100</span></p>
            <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full font-bold text-sm ${
              getScoreLabel(healthScore) === 'Excelente' ? 'bg-green-500/30 text-green-100' :
              getScoreLabel(healthScore) === 'Bom' ? 'bg-yellow-500/30 text-yellow-100' :
              'bg-red-500/30 text-red-100'
            }`}>
              <span className="text-xl">
                {getScoreLabel(healthScore) === 'Excelente' ? '🎉' :
                 getScoreLabel(healthScore) === 'Bom' ? '👍' : '⚠️'}
              </span>
              <span>{getScoreLabel(healthScore)}</span>
            </div>
          </div>
          
          {/* Circular progress */}
          <div className="relative w-40 h-40">
            <svg className="transform -rotate-90 w-40 h-40">
              <circle
                cx="80"
                cy="80"
                r="70"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="12"
                fill="none"
              />
              <circle
                cx="80"
                cy="80"
                r="70"
                stroke="white"
                strokeWidth="12"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 70}`}
                strokeDashoffset={`${2 * Math.PI * 70 * (1 - healthScore / 100)}`}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-4xl font-black">{healthScore}</span>
            </div>
          </div>
        </div>

        {/* Barra de progresso */}
        <div className="relative z-10 mt-6">
          <div className="w-full bg-white/20 backdrop-blur-sm rounded-full h-4 overflow-hidden">
            <div
              className="bg-white rounded-full h-4 transition-all duration-1000 ease-out shadow-lg"
              style={{ width: `${healthScore}%` }}
            ></div>
          </div>
          <div className="flex justify-between mt-2 text-xs text-white/70 font-medium">
            <span>0</span>
            <span>Péssimo</span>
            <span>Regular</span>
            <span>Bom</span>
            <span>Excelente</span>
            <span>100</span>
          </div>
        </div>
      </div>

      {/* Métricas Principais - Redesenhadas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Taxa de Poupança */}
        <div className="bg-white rounded-2xl p-6 shadow-xl border-2 border-green-100 hover:border-green-300 transition-all duration-300 hover:shadow-2xl group">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Taxa de Poupança</h3>
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="mb-4">
            <p className="text-5xl font-black text-gray-900 mb-1">{taxaPoupanca.toFixed(1)}<span className="text-2xl text-gray-600">%</span></p>
            <p className="text-sm text-gray-600 font-medium">Poupança: <span className="font-bold text-green-600">{formatCurrency(metrics.poupancaMensal)}</span>/mês</p>
          </div>
          <div className="relative">
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
              <div
                className="bg-gradient-to-r from-green-400 to-green-600 rounded-full h-4 transition-all duration-700 ease-out relative"
                style={{ width: `${Math.min(parseFloat(taxaPoupanca), 100)}%` }}
              >
                <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
              </div>
            </div>
            <div className="flex justify-between items-center mt-2">
              <p className="text-xs text-gray-500 font-semibold">Meta: 20%</p>
              {taxaPoupanca >= 20 && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold">✓ Alcançada</span>
              )}
            </div>
          </div>
        </div>

        {/* Fundo de Emergência */}
        <div className="bg-white rounded-2xl p-6 shadow-xl border-2 border-blue-100 hover:border-blue-300 transition-all duration-300 hover:shadow-2xl group">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Fundo Emergência</h3>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-110 group-hover:-rotate-12 transition-all duration-300">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
          <div className="mb-4">
            <p className="text-4xl font-black text-gray-900 mb-1">{formatCurrency(metrics.fundoEmergencia)}</p>
            <p className="text-sm text-gray-600 font-medium">Equivale a <span className="font-bold text-blue-600">{mesesFundoEmergencia.toFixed(1)}</span> meses</p>
          </div>
          <div className="relative">
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-400 to-blue-600 rounded-full h-4 transition-all duration-700 ease-out"
                style={{ width: `${Math.min((parseFloat(mesesFundoEmergencia) / 6) * 100, 100)}%` }}
              ></div>
            </div>
            <div className="flex justify-between items-center mt-2">
              <p className="text-xs text-gray-500 font-semibold">Meta: 6 meses</p>
              {mesesFundoEmergencia >= 6 && (
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-bold">✓ Alcançada</span>
              )}
            </div>
          </div>
        </div>

        {/* Taxa de Endividamento */}
        <div className="bg-white rounded-2xl p-6 shadow-xl border-2 border-red-100 hover:border-red-300 transition-all duration-300 hover:shadow-2xl group">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Endividamento</h3>
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="mb-4">
            <p className="text-5xl font-black text-gray-900 mb-1">{taxaEndividamento.toFixed(1)}<span className="text-2xl text-gray-600">%</span></p>
            <p className="text-sm text-gray-600 font-medium">Dívidas: <span className="font-bold text-red-600">{formatCurrency(metrics.dividas)}</span></p>
          </div>
          <div className="relative">
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
              <div
                className={`rounded-full h-4 transition-all duration-700 ease-out ${
                  taxaEndividamento > 30 ? 'bg-gradient-to-r from-red-500 to-red-700' :
                  taxaEndividamento > 20 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                  'bg-gradient-to-r from-green-400 to-green-600'
                }`}
                style={{ width: `${Math.min(parseFloat(taxaEndividamento), 100)}%` }}
              ></div>
            </div>
            <div className="flex justify-between items-center mt-2">
              <p className="text-xs text-gray-500 font-semibold">Máx: 30%</p>
              {taxaEndividamento <= 30 && (
                <span className={`text-xs px-2 py-1 rounded-full font-bold ${
                  taxaEndividamento <= 20 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {taxaEndividamento <= 20 ? '✓ Ótimo' : '⚠ Atenção'}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Análise Detalhada */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Receitas vs Despesas - Redesenhado */}
        <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900">Receitas vs Despesas</h3>
          </div>
          <div className="space-y-5">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-bold text-gray-700">Receitas Mensais</span>
                </div>
                <span className="text-lg font-black text-green-600">{formatCurrency(metrics.rendaMensal)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner">
                <div className="bg-gradient-to-r from-green-400 to-green-600 rounded-full h-4 shadow-lg" style={{ width: '100%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm font-bold text-gray-700">Despesas Mensais</span>
                </div>
                <span className="text-lg font-black text-red-600">{formatCurrency(metrics.despesasMensais)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner">
                <div
                  className="bg-gradient-to-r from-red-400 to-red-600 rounded-full h-4 shadow-lg"
                  style={{ width: `${metrics.rendaMensal > 0 ? (metrics.despesasMensais / metrics.rendaMensal) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
            <div className="pt-5 border-t-2 border-gray-200">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary to-primary-dark rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="text-sm font-bold text-white">Saldo Mensal</span>
                </div>
                <span className="text-2xl font-black text-white">{formatCurrency(metrics.poupancaMensal)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recomendações - Redesenhadas */}
        <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900">Recomendações</h3>
          </div>
          <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
            {parseFloat(taxaPoupanca) >= 20 && parseFloat(mesesFundoEmergencia) >= 6 && parseFloat(taxaEndividamento) <= 20 && (
              <div className="flex items-start space-x-3 p-4 bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-200 rounded-xl">
                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-bold text-green-900">🎉 Excelente saúde financeira!</p>
                  <p className="text-xs text-green-700 mt-1 font-medium">Suas finanças estão impecáveis. Continue mantendo essas boas práticas!</p>
                </div>
              </div>
            )}
            {parseFloat(taxaPoupanca) < 20 && (
              <div className="flex items-start space-x-3 p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 border-2 border-yellow-200 rounded-xl">
                <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-bold text-yellow-900">💰 Aumente sua taxa de poupança</p>
                  <p className="text-xs text-yellow-700 mt-1 font-medium">Tente poupar pelo menos 20% da sua renda mensal. Revise seus gastos e identifique onde pode economizar.</p>
                </div>
              </div>
            )}
            {parseFloat(mesesFundoEmergencia) < 6 && (
              <div className="flex items-start space-x-3 p-4 bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-bold text-blue-900">🛡️ Construa seu fundo de emergência</p>
                  <p className="text-xs text-blue-700 mt-1 font-medium">Procure ter pelo menos 6 meses de despesas guardadas para imprevistos. Você está a {(6 - mesesFundoEmergencia).toFixed(1)} meses da meta!</p>
                </div>
              </div>
            )}
            {parseFloat(taxaEndividamento) > 30 && (
              <div className="flex items-start space-x-3 p-4 bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-200 rounded-xl">
                <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-bold text-red-900">⚠️ Reduza seu endividamento</p>
                  <p className="text-xs text-red-700 mt-1 font-medium">Sua taxa de endividamento está acima do recomendado. Priorize o pagamento de dívidas com juros mais altos.</p>
                </div>
              </div>
            )}
            {metrics.investimentos > 0 && (
              <div className="flex items-start space-x-3 p-4 bg-gradient-to-r from-purple-50 to-purple-100 border-2 border-purple-200 rounded-xl">
                <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-bold text-purple-900">📈 Ótimo trabalho com investimentos!</p>
                  <p className="text-xs text-purple-700 mt-1 font-medium">Continue diversificando seu portfólio. Total investido: {formatCurrency(metrics.investimentos)}</p>
                </div>
              </div>
            )}
            {metrics.investimentos === 0 && parseFloat(taxaPoupanca) >= 10 && (
              <div className="flex items-start space-x-3 p-4 bg-gradient-to-r from-indigo-50 to-indigo-100 border-2 border-indigo-200 rounded-xl">
                <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-bold text-indigo-900">💎 Considere começar a investir</p>
                  <p className="text-xs text-indigo-700 mt-1 font-medium">Você tem uma boa taxa de poupança. Que tal diversificar com investimentos para fazer seu dinheiro crescer?</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(10deg); }
        }
      `}</style>
    </div>
  )
}

export default FinancialHealth

