import { useState, useEffect } from 'react'
import { apiFetch, API_BASE_URL } from '../../config/api'
import { useToast } from '../Toast'

function AddTransaction({ userData }) {
  const { showToast } = useToast()
  const [transactionType, setTransactionType] = useState('despesa')
  const [formData, setFormData] = useState({
    descricao: '',
    valor: '',
    categoria: '',
    data: new Date().toISOString().split('T')[0],
    notas: '',
  })

  const [recentTransactions, setRecentTransactions] = useState([])
  const [categories, setCategories] = useState({ despesa: [], receita: [] })
  const [loading, setLoading] = useState(false)
  const [summary, setSummary] = useState({
    despesasMes: 0,
    receitasMes: 0,
    saldoMes: 0
  })

  useEffect(() => {
    fetchCategories()
    fetchRecentTransactions()
    fetchSummary()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await apiFetch('/api/categories', {
        method: 'GET',
        credentials: 'include',
      })

      if (response.ok) {
        const data = await response.json()
        const cats = data.categories || []
        
        // Separar categorias por tipo (baseado no nome)
        const despesaCats = ['Alimentação', 'Transporte', 'Habitação', 'Saúde', 'Lazer', 'Educação', 'Serviços', 'Outros']
        const receitaCats = ['Salário', 'Freelance', 'Investimentos', 'Vendas', 'Presentes', 'Outros']
        
        // Adicionar categorias do banco que não estão nas listas padrão
        const catNames = cats.map(c => c.name)
        despesaCats.push(...catNames.filter(c => !despesaCats.includes(c) && !receitaCats.includes(c)))
        
        setCategories({
          despesa: [...new Set(despesaCats)],
          receita: [...new Set(receitaCats)]
        })
      }
    } catch (err) {
      console.error('Erro ao buscar categorias:', err)
      // Fallback para categorias padrão
      setCategories({
        despesa: ['Alimentação', 'Transporte', 'Habitação', 'Saúde', 'Lazer', 'Educação', 'Serviços', 'Outros'],
        receita: ['Salário', 'Freelance', 'Investimentos', 'Vendas', 'Presentes', 'Outros'],
      })
    }
  }

  const fetchRecentTransactions = async () => {
    try {
      const response = await apiFetch('/api/transactions?limit=5', {
        method: 'GET',
        credentials: 'include',
      })

      if (response.ok) {
        const data = await response.json()
        const transactions = (data.transactions || []).map(t => ({
          id: t.id,
          descricao: t.notes || 'Sem descrição',
          categoria: t.categories?.name || 'Outros',
          valor: parseFloat(t.amount),
          tipo: t.type === 'income' ? 'receita' : 'despesa',
          data: t.date
        }))
        setRecentTransactions(transactions)
      }
    } catch (err) {
      console.error('Erro ao buscar transações recentes:', err)
    }
  }

  const fetchSummary = async () => {
    try {
      const response = await apiFetch('/api/activity-summary', {
        method: 'GET',
        credentials: 'include',
      })

      if (response.ok) {
        const data = await response.json()
        setSummary({
          despesasMes: data.despesasMes || 0,
          receitasMes: data.receitasMes || 0,
          saldoMes: data.saldoAtual || 0
        })
      }
    } catch (err) {
      console.error('Erro ao buscar resumo:', err)
    }
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR'
    }).format(value)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.descricao || !formData.valor || !formData.categoria) {
      showToast('Por favor, preencha todos os campos obrigatórios', 'warning')
      return
    }

    setLoading(true)
    try {
      const response = await apiFetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          descricao: formData.descricao,
          valor: parseFloat(formData.valor),
          tipo: transactionType,
          categoria: formData.categoria,
          data: formData.data,
          notas: formData.notas,
          moeda: 'EUR'
        }),
      })

      if (response.ok) {
        const data = await response.json()
        
        // Adicionar à lista de transações recentes
        const newTransaction = {
          id: data.transaction.id,
          descricao: formData.descricao,
          categoria: formData.categoria,
          valor: parseFloat(formData.valor),
          tipo: transactionType,
          data: formData.data
        }
        setRecentTransactions([newTransaction, ...recentTransactions.slice(0, 4)])
        
        // Reset form
        setFormData({
          descricao: '',
          valor: '',
          categoria: '',
          data: new Date().toISOString().split('T')[0],
          notas: '',
        })
        
        // Atualizar resumo
        await fetchSummary()
        
        showToast('Transação adicionada com sucesso!', 'success')
      } else {
        const error = await response.json()
        showToast(`Erro ao adicionar transação: ${error.error || 'Erro desconhecido'}`, 'error')
      }
    } catch (err) {
      console.error('Erro ao adicionar transação:', err)
      showToast('Erro ao adicionar transação. Por favor, tente novamente.', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary/80">Transações</p>
        <h2 className="text-2xl font-bold text-gray-900">Adicionar Transação</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulário */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            {/* Toggle Despesa/Receita */}
            <div className="mb-6">
              <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => {
                    setTransactionType('despesa')
                    setFormData({ ...formData, categoria: '' })
                  }}
                  className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                    transactionType === 'despesa'
                      ? 'bg-red-500 text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                    <span>Despesa</span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTransactionType('receita')
                    setFormData({ ...formData, categoria: '' })
                  }}
                  className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                    transactionType === 'receita'
                      ? 'bg-green-500 text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Receita</span>
                  </div>
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
                <input
                  type="text"
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Ex: Supermercado, Salário, etc."
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Valor (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={formData.valor}
                    onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="0.00"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Data</label>
                  <input
                    type="date"
                    value={formData.data}
                    onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Categoria</label>
                <select
                  value={formData.categoria}
                  onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                >
                  <option value="">Selecione uma categoria</option>
                  {categories[transactionType]?.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notas (opcional)</label>
                <textarea
                  value={formData.notas}
                  onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  rows="3"
                  placeholder="Adicione alguma observação sobre esta transação..."
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full px-4 py-3 rounded-lg font-semibold text-white transition-all duration-200 ${
                  loading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : transactionType === 'despesa'
                    ? 'bg-red-500 hover:bg-red-600'
                    : 'bg-green-500 hover:bg-green-600'
                }`}
              >
                {loading ? 'A adicionar...' : `Adicionar ${transactionType === 'despesa' ? 'Despesa' : 'Receita'}`}
              </button>
            </form>
          </div>
        </div>

        {/* Resumo e Transações Recentes */}
        <div className="space-y-6">
          {/* Resumo Rápido */}
          <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-6 text-white shadow-lg">
            <h3 className="text-sm font-medium text-gray-200 mb-4">Resumo Rápido</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-200">Total de Despesas</span>
                <span className="text-lg font-bold">{formatCurrency(summary.despesasMes)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-200">Total de Receitas</span>
                <span className="text-lg font-bold">{formatCurrency(summary.receitasMes)}</span>
              </div>
              <div className="pt-3 border-t border-white/20">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-200">Saldo do Mês</span>
                  <span className={`text-xl font-bold ${summary.saldoMes >= 0 ? 'text-green-200' : 'text-red-200'}`}>
                    {formatCurrency(summary.saldoMes)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Transações Recentes */}
          {recentTransactions.length > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Transações Recentes</h3>
              <div className="space-y-3">
                {recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{transaction.descricao}</p>
                      <p className="text-xs text-gray-500">{transaction.categoria}</p>
                    </div>
                    <p className={`text-sm font-bold ${transaction.tipo === 'receita' ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.tipo === 'receita' ? '+' : '-'}{formatCurrency(transaction.valor)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Dicas */}
          <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
            <h3 className="text-sm font-bold text-blue-900 mb-2">💡 Dica</h3>
            <p className="text-xs text-blue-700">
              Registre todas as suas transações para ter um controle financeiro mais preciso e tomar melhores decisões.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AddTransaction
