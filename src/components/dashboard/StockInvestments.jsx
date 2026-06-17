import { useState, useEffect } from 'react'
import { apiFetch, SERVICES } from '../../config/api'
import { useToast } from '../Toast'
import Modal from '../Modal'
import { LoadingSpinner } from '../Skeleton'

function StockInvestments({ userData }) {
  const { showToast } = useToast()
  const [investments, setInvestments] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingPrices, setLoadingPrices] = useState({})
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)

  const [showModal, setShowModal] = useState(false)
  const [newInvestment, setNewInvestment] = useState({
    simbolo: '',
    nome: '',
    quantidade: '',
    precoCompra: '',
  })
  const [searchQuery, setSearchQuery] = useState('')

  // Carregar investimentos do backend
  useEffect(() => {
    if (userData?.user_id) {
      fetchInvestmentsFromDB()
    }
  }, [userData])

  const fetchInvestmentsFromDB = async () => {
    setLoading(true)
    try {
      const response = await apiFetch('/api/investments', {
        method: 'GET',
        credentials: 'include',
      })
      if (response.ok) {
        const data = await response.json()
        if (data.investments) {
          setInvestments(data.investments.map(inv => {
            const precoCompra = inv.avg_price && inv.avg_price > 0 ? inv.avg_price : (inv.last_price || 0)
            const precoAtual = inv.last_price || inv.avg_price || 0
            return {
              id: inv.id,
              simbolo: inv.symbol,
              nome: inv.symbol,
              quantidade: inv.quantity,
              precoCompra: precoCompra,
              precoAtual: precoAtual,
              variacao: precoCompra > 0 ? ((precoAtual - precoCompra) / precoCompra * 100) : 0,
            }
          }))
        }
      }
    } catch (error) {
      console.error('Erro ao carregar investimentos:', error)
    } finally {
      // Pequeno delay para evitar flash
      setTimeout(() => setLoading(false), 300)
    }
  }

  // Atualizar preços em tempo real ao carregar
  useEffect(() => {
    if (investments.length > 0) {
      investments.forEach(investment => {
        fetchStockPrice(investment.simbolo, investment.id)
      })
    }
  }, [])

  // Atualizar preços periodicamente a cada 30 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      investments.forEach(investment => {
        fetchStockPrice(investment.simbolo, investment.id)
      })
    }, 30000)

    return () => clearInterval(interval)
  }, [investments])

  const fetchStockPrice = async (symbol, investmentId) => {
    if (!symbol) return

    setLoadingPrices(prev => ({ ...prev, [investmentId]: true }))

    try {
      const response = await apiFetch(`/api/stock/${symbol}`)
      if (response.ok) {
        const data = await response.json()

        setInvestments(prev =>
          prev.map(inv => {
            if (inv.id === investmentId) {
              // Proteger contra divisão por zero e valores inválidos
              let variacao = 0
              if (inv.precoCompra && inv.precoCompra > 0) {
                variacao = ((data.price - inv.precoCompra) / inv.precoCompra * 100)
              }
              return { ...inv, precoAtual: data.price, variacao: isNaN(variacao) ? 0 : variacao }
            }
            return inv
          })
        )
      } else {
        console.error(`Erro ao buscar preço de ${symbol}`)
      }
    } catch (error) {
      console.error(`Erro ao buscar preço de ${symbol}:`, error)
    } finally {
      setLoadingPrices(prev => ({ ...prev, [investmentId]: false }))
    }
  }

  const searchStocks = async (query) => {
    if (!query || query.length < 1) {
      setSearchResults([])
      return
    }

    setSearching(true)
    try {
      const response = await apiFetch(`/api/investments/search?q=${query}`)
      if (response.ok) {
        const data = await response.json()
        setSearchResults(data.results || [])
      }
    } catch (error) {
      console.error('Erro ao buscar ações:', error)
      showToast('Erro ao buscar ações', 'error')
    } finally {
      setSearching(false)
    }
  }

  const handleSymbolSearch = (e) => {
    const value = e.target.value.toUpperCase()
    setSearchQuery(value)
    if (value.length > 0) {
      searchStocks(value)
    } else {
      setSearchResults([])
    }
  }

  const selectStock = async (symbol, name) => {
    setNewInvestment(prev => ({ ...prev, simbolo: symbol, nome: name }))
    setSearchResults([])
    setSearchQuery('')

    // Buscar preço atual para sugestão
    try {
      const response = await apiFetch(`/api/investments/price/${symbol}`)
      if (response.ok) {
        const data = await response.json()
        setNewInvestment(prev => ({ ...prev, precoCompra: data.price.toFixed(2) }))
      }
    } catch (error) {
      console.error('Erro ao buscar preço:', error)
    }
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR'
    }).format(value)
  }

  const calculateTotal = (investments) => {
    return investments.reduce((total, inv) => {
      return total + (inv.precoAtual * inv.quantidade)
    }, 0)
  }

  const calculateTotalInvested = (investments) => {
    return investments.reduce((total, inv) => {
      return total + (inv.precoCompra * inv.quantidade)
    }, 0)
  }

  const calculateProfit = (investments) => {
    return calculateTotal(investments) - calculateTotalInvested(investments)
  }

  const totalAtual = calculateTotal(investments)
  const totalInvestido = calculateTotalInvested(investments)
  const lucroPrejuizo = calculateProfit(investments)
  const percentagemLucro = totalInvestido > 0 ? ((lucroPrejuizo / totalInvestido) * 100).toFixed(2) : 0

  const handleAddInvestment = async () => {
    if (newInvestment.simbolo && newInvestment.nome && newInvestment.quantidade && newInvestment.precoCompra) {
      const investmentData = {
        symbol: newInvestment.simbolo.toUpperCase(),
        quantity: parseInt(newInvestment.quantidade),
        purchase_price: parseFloat(newInvestment.precoCompra),
      }

      try {
        const response = await apiFetch('/api/investments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(investmentData),
        })

        if (response.ok) {
          const data = await response.json()
          const investment = {
            id: data.investment.id,
            simbolo: data.investment.symbol,
            nome: data.investment.symbol,
            quantidade: data.investment.quantity,
            precoCompra: data.investment.avg_price,
            precoAtual: data.investment.last_price || data.investment.avg_price,
            variacao: 0,
          }
          const updatedInvestments = [...investments, investment]
          setInvestments(updatedInvestments)
          setNewInvestment({ simbolo: '', nome: '', quantidade: '', precoCompra: '' })
          setShowModal(false)
          setSearchQuery('')
          showToast('Investimento adicionado com sucesso!', 'success')

          // Buscar preço atualizado
          setTimeout(() => fetchStockPrice(investment.simbolo, investment.id), 500)
        } else {
          showToast('Erro ao adicionar investimento', 'error')
        }
      } catch (error) {
        console.error('Erro ao adicionar investimento:', error)
        showToast('Erro ao adicionar investimento', 'error')
      }
    } else {
      showToast('Por favor, preencha todos os campos obrigatórios', 'warning')
    }
  }

  const handleDeleteInvestment = async (id) => {
    try {
      const response = await fetch(`${SERVICES.INVESTMENTS}/investments/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (response.ok) {
        const updatedInvestments = investments.filter(inv => inv.id !== id)
        setInvestments(updatedInvestments)
        showToast('Investimento removido', 'success')
      } else {
        showToast('Erro ao remover investimento', 'error')
      }
    } catch (error) {
      console.error('Erro ao remover investimento:', error)
      showToast('Erro ao remover investimento', 'error')
    }
  }

  const handleRefreshPrice = (symbol, id) => {
    fetchStockPrice(symbol, id)
  }

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">Investimentos</p>
          <h2 className="text-2xl font-bold text-gray-900">Gestão de Ações</h2>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Adicionar Ação</span>
        </button>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl p-4 bg-slate-900 text-white shadow-lg">
          <p className="text-xs text-white/80">Valor Atual</p>
          <p className="text-2xl font-bold">{formatCurrency(calculateTotal(investments))}</p>
        </div>
        <div className="rounded-xl p-4 bg-white border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-500">Total Investido</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(calculateTotalInvested(investments))}</p>
        </div>
        <div className="rounded-xl p-4 bg-white border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500">Ações na carteira</p>
            <p className="text-2xl font-bold text-gray-900">{investments.length}</p>
          </div>
          <div className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-semibold">Em carteira</div>
        </div>
      </div>

      {/* Lista de Investimentos */}
      {investments.length > 0 ? (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <div className="w-2 h-6 bg-primary rounded-full" />
              Meus Investimentos
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Ação</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Qtd</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Preço Compra</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Preço Atual</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Valor</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {investments.map((investment) => {
                  const valorTotal = investment.precoAtual * investment.quantidade
                  const lucro = (investment.precoAtual - investment.precoCompra) * investment.quantidade
                  const isLoading = loadingPrices[investment.id]
                  return (
                    <tr key={investment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-bold text-gray-900">{investment.simbolo}</div>
                          <div className="text-sm text-gray-500">{investment.nome}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{investment.quantidade}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(investment.precoCompra)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-bold text-gray-900">
                            {isLoading ? (
                              <LoadingSpinner className="h-4 w-4" containerClassName="flex items-center h-5" />
                            ) : (
                              formatCurrency(investment.precoAtual)
                            )}
                          </span>
                          <button
                            onClick={() => handleRefreshPrice(investment.simbolo, investment.id)}
                            disabled={isLoading}
                            className="text-primary hover:text-primary-dark transition-colors disabled:opacity-50"
                          >
                            <svg className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{formatCurrency(valorTotal)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                        <button
                          onClick={() => handleDeleteInvestment(investment.id)}
                          className="text-red-600 hover:text-red-800 font-medium transition-colors"
                        >
                          Remover
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-gray-500 text-lg mb-4">Nenhum investimento ainda</p>
          <p className="text-gray-400 mb-6">Comece adicionando sua primeira ação</p>
          <button
            onClick={() => setShowModal(true)}
            className="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-lg font-semibold transition-all duration-200"
          >
            Adicionar Primeira Ação
          </button>
        </div>
      )}

      {/* Modal para adicionar investimento */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false)
          setSearchQuery('')
          setSearchResults([])
          setNewInvestment({ simbolo: '', nome: '', quantidade: '', precoCompra: '' })
        }}
        title="Adicionar Novo Investimento"
      >
        <div className="space-y-5">
          {/* Símbolo da Ação com busca */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-2">
              <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span>Símbolo da Ação</span>
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={handleSymbolSearch}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 font-medium"
              placeholder="Ex: AAPL, TSLA, GOOGL..."
              autoComplete="off"
            />
            {searching && (
              <div className="flex items-center space-x-2 mt-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                <p className="text-sm text-gray-500 font-medium">Procurando ações...</p>
              </div>
            )}
            {searchResults.length > 0 && (
              <div className="mt-3 border-2 border-primary/20 rounded-xl max-h-56 overflow-y-auto shadow-lg">
                {searchResults.map((result, idx) => (
                  <button
                    key={idx}
                    onClick={() => selectStock(result.symbol || result.ticker, result.name)}
                    className="w-full text-left px-4 py-3 hover:bg-primary/5 border-b border-gray-200 last:border-b-0 transition-all duration-200 group"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-bold text-sm text-gray-900 group-hover:text-primary">{result.symbol || result.ticker}</div>
                        <div className="text-xs text-gray-500 mt-1">{result.name}</div>
                      </div>
                      <svg className="w-5 h-5 text-gray-400 group-hover:text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>
                ))}
              </div>
            )}
            {newInvestment.simbolo && (
              <div className="mt-3 flex items-center space-x-2 p-3 bg-green-50 border-2 border-green-200 rounded-xl">
                <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-green-700 font-semibold">Símbolo selecionado: {newInvestment.simbolo}</p>
              </div>
            )}
          </div>

          {/* Nome da Empresa */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-2">
              <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span>Nome da Empresa</span>
            </label>
            <input
              type="text"
              value={newInvestment.nome}
              onChange={(e) => setNewInvestment({ ...newInvestment, nome: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 font-medium"
              placeholder="Ex: Apple Inc."
            />
          </div>

          {/* Quantidade e Preço em grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Quantidade */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-2">
                <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                </svg>
                <span>Quantidade</span>
              </label>
              <input
                type="number"
                value={newInvestment.quantidade}
                onChange={(e) => setNewInvestment({ ...newInvestment, quantidade: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 font-bold text-lg"
                placeholder="10"
                min="1"
              />
            </div>

            {/* Preço de Compra */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-2">
                <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Preço (€)</span>
              </label>
              <input
                type="number"
                step="0.01"
                value={newInvestment.precoCompra}
                onChange={(e) => setNewInvestment({ ...newInvestment, precoCompra: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 font-bold text-lg"
                placeholder="150.00"
                min="0"
              />
            </div>
          </div>

          {/* Dica */}
          {newInvestment.simbolo && (
            <div className="flex items-start space-x-2 p-3 bg-blue-50 border-2 border-blue-200 rounded-xl">
              <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-xs text-blue-700 font-medium">
                💡 Dica: O preço sugerido é baseado na cotação atual da ação. Verifique se o valor está correto antes de adicionar.
              </p>
            </div>
          )}

          {/* Resumo do investimento */}
          {newInvestment.quantidade && newInvestment.precoCompra && (
            <div className="p-4 bg-slate-100 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-600">Investimento Total:</span>
                <span className="text-2xl font-black text-slate-900">
                  {new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(
                    parseFloat(newInvestment.quantidade) * parseFloat(newInvestment.precoCompra)
                  )}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {newInvestment.quantidade} ações × {new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(parseFloat(newInvestment.precoCompra))}
              </p>
            </div>
          )}

          {/* Botões */}
          <div className="flex space-x-3 pt-4">
            <button
              onClick={() => {
                setShowModal(false)
                setSearchQuery('')
                setSearchResults([])
                setNewInvestment({ simbolo: '', nome: '', quantidade: '', precoCompra: '' })
              }}
              className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 font-bold hover:bg-gray-50 transition-all duration-200 hover:border-gray-400"
            >
              Cancelar
            </button>
            <button
              onClick={handleAddInvestment}
              disabled={!newInvestment.simbolo || !newInvestment.nome || !newInvestment.quantidade || !newInvestment.precoCompra}
              className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Adicionar Investimento
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default StockInvestments

