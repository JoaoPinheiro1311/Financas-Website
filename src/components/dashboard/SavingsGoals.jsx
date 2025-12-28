import { useState, useEffect } from 'react'
import { apiFetch, API_BASE_URL } from '../../config/api'
import { useToast } from '../Toast'
import Modal from '../Modal'

function SavingsGoals({ userData }) {
  const { showToast } = useToast()
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [showModal, setShowModal] = useState(false)
  const [showAddValueModal, setShowAddValueModal] = useState(false)
  const [selectedGoal, setSelectedGoal] = useState(null)
  const [addValueAmount, setAddValueAmount] = useState('')
  const [newGoal, setNewGoal] = useState({
    nome: '',
    valorObjetivo: '',
    prazo: '',
    categoria: 'Outros'
  })

  useEffect(() => {
    fetchSavingsGoals()
  }, [userData])

  const fetchSavingsGoals = async () => {
    if (!userData?.user_id) {
      setLoading(false)
      return
    }
    
    setLoading(true)
    setError(null)
    
    try {
      const response = await apiFetch('/api/savings-goals', {
        method: 'GET',
        credentials: 'include',
      })
      
      if (response.ok) {
        const data = await response.json()
        setGoals(data.goals || [])
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Erro ao carregar objetivos de poupança.')
        showToast('Erro ao carregar objetivos de poupança', 'error')
      }
    } catch (err) {
      console.error('Error fetching savings goals:', err)
      setError('Erro de rede ou servidor.')
      showToast('Erro ao carregar objetivos de poupança', 'error')
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
    return date.toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  const getProgress = (atual, objetivo) => {
    return Math.min((atual / objetivo) * 100, 100)
  }

  const getDaysUntil = (dateString) => {
    const today = new Date()
    const target = new Date(dateString)
    const diff = Math.ceil((target - today) / (1000 * 60 * 60 * 24))
    return diff
  }

  const totalGuardado = goals.reduce((acc, g) => acc + (g.valorAtual || 0), 0)
  const totalObjetivo = goals.reduce((acc, g) => acc + (g.valorObjetivo || 0), 0)
  const progressoMedio = totalObjetivo > 0 ? Math.min((totalGuardado / totalObjetivo) * 100, 100) : 0
  const metasConcluidas = goals.filter((g) => g.valorAtual >= g.valorObjetivo).length

  const handleAddGoal = async () => {
    if (!newGoal.nome || !newGoal.valorObjetivo || !newGoal.prazo) {
      showToast('Por favor, preencha todos os campos obrigatórios', 'warning')
      return
    }

    try {
      const response = await apiFetch('/api/savings-goals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          nome: newGoal.nome,
          valorObjetivo: parseFloat(newGoal.valorObjetivo),
          prazo: newGoal.prazo,
          valorAtual: 0
        }),
      })

      if (response.ok) {
        const result = await response.json()
        showToast(result.message || 'Objetivo de poupança criado com sucesso!', 'success')
        setNewGoal({ nome: '', valorObjetivo: '', prazo: '', categoria: 'Outros' })
        setShowModal(false)
        fetchSavingsGoals() // Recarregar lista
      } else {
        const errorData = await response.json()
        showToast(errorData.error || 'Erro ao criar objetivo de poupança', 'error')
      }
    } catch (err) {
      console.error('Error creating savings goal:', err)
      showToast('Erro ao criar objetivo de poupança', 'error')
    }
  }

  const handleAddValue = async () => {
    if (!addValueAmount || parseFloat(addValueAmount) <= 0) {
      showToast('Por favor, insira um valor válido', 'warning')
      return
    }

    if (!selectedGoal) return

    try {
      const newCurrentAmount = selectedGoal.valorAtual + parseFloat(addValueAmount)
      const response = await fetch(`http://localhost:5000/api/savings-goals/${selectedGoal.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          valorAtual: newCurrentAmount
        }),
      })

      if (response.ok) {
        showToast('Valor adicionado com sucesso!', 'success')
        setAddValueAmount('')
        setShowAddValueModal(false)
        setSelectedGoal(null)
        fetchSavingsGoals() // Recarregar lista
      } else {
        const errorData = await response.json()
        showToast(errorData.error || 'Erro ao adicionar valor', 'error')
      }
    } catch (err) {
      console.error('Error adding value to goal:', err)
      showToast('Erro ao adicionar valor', 'error')
    }
  }

  const handleDeleteGoal = async (goalId) => {
    // Usar confirm nativo por enquanto, pode ser melhorado com um modal customizado
    if (!window.confirm('Tem certeza que deseja deletar este objetivo? Esta ação não pode ser desfeita.')) {
      return
    }

    try {
      const response = await fetch(`http://localhost:5000/api/savings-goals/${goalId}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (response.ok) {
        showToast('Objetivo deletado com sucesso!', 'success')
        fetchSavingsGoals() // Recarregar lista
      } else {
        const errorData = await response.json()
        showToast(errorData.error || 'Erro ao deletar objetivo', 'error')
      }
    } catch (err) {
      console.error('Error deleting savings goal:', err)
      showToast('Erro ao deletar objetivo', 'error')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error && goals.length === 0) {
    return (
      <div className="text-red-500 text-center p-4">
        {error}
        <button
          onClick={fetchSavingsGoals}
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
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary/80">Poupança</p>
          <h2 className="text-2xl font-bold text-gray-900">Objetivos de Poupança</h2>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Novo Objetivo</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <p className="text-xs text-gray-500">Guardado</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalGuardado)}</p>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <p className="text-xs text-gray-500">Objetivos Totais</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalObjetivo)}</p>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <p className="text-xs text-gray-500">Progresso Médio</p>
          <p className="text-2xl font-bold text-primary">{progressoMedio.toFixed(0)}%</p>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500">Metas concluídas</p>
            <p className="text-2xl font-bold text-gray-900">{metasConcluidas}</p>
          </div>
          <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-700 font-semibold">{goals.length} totais</span>
        </div>
      </div>

      {goals.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 shadow-lg border border-gray-100 text-center">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Nenhum objetivo de poupança</h3>
          <p className="text-gray-500 mb-6">Comece criando seu primeiro objetivo de poupança!</p>
          <button
            onClick={() => setShowModal(true)}
            className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200"
          >
            Criar Primeiro Objetivo
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.map((goal) => {
          const progress = getProgress(goal.valorAtual, goal.valorObjetivo)
          const daysUntil = getDaysUntil(goal.prazo)
          const remaining = goal.valorObjetivo - goal.valorAtual
          const monthlyNeeded = daysUntil > 0 ? remaining / Math.max(daysUntil / 30, 1) : remaining

          return (
            <div key={goal.id} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.08em] text-gray-500">Objetivo</p>
                  <h3 className="text-lg font-bold text-gray-900">{goal.nome}</h3>
                </div>
                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">{goal.categoria}</span>
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Progresso</span>
                  <span className="text-sm font-bold text-gray-900">{progress.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-primary to-primary-dark rounded-full h-3 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Atual</span>
                  <span className="text-lg font-bold text-gray-900">{formatCurrency(goal.valorAtual)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Objetivo</span>
                  <span className="text-lg font-bold text-primary">{formatCurrency(goal.valorObjetivo)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Falta</span>
                  <span className="text-sm font-semibold text-orange-600">{formatCurrency(remaining)}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-500">Prazo</span>
                  <span className="text-xs font-medium text-gray-700">{formatDate(goal.prazo)}</span>
                </div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-gray-500">Poupança mensal necessária</span>
                  <span className="text-xs font-bold text-primary">{formatCurrency(monthlyNeeded)}</span>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setSelectedGoal(goal)
                      setShowAddValueModal(true)
                    }}
                    className="flex-1 px-3 py-2 bg-primary hover:bg-primary-dark text-white text-xs font-semibold rounded-lg transition-colors"
                  >
                    Adicionar Valor
                  </button>
                  <button
                    onClick={() => handleDeleteGoal(goal.id)}
                    className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )
        })}
        </div>
      )}

      {/* Modal para adicionar novo objetivo */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Novo Objetivo de Poupança"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nome do Objetivo</label>
            <input
              type="text"
              value={newGoal.nome}
              onChange={(e) => setNewGoal({ ...newGoal, nome: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Ex: Férias de Verão"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Valor Objetivo (€)</label>
            <input
              type="number"
              value={newGoal.valorObjetivo}
              onChange={(e) => setNewGoal({ ...newGoal, valorObjetivo: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="2000"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Prazo</label>
            <input
              type="date"
              value={newGoal.prazo}
              onChange={(e) => setNewGoal({ ...newGoal, prazo: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Categoria</label>
            <select
              value={newGoal.categoria}
              onChange={(e) => setNewGoal({ ...newGoal, categoria: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="Outros">Outros</option>
              <option value="Lazer">Lazer</option>
              <option value="Segurança">Segurança</option>
              <option value="Grande Compra">Grande Compra</option>
              <option value="Educação">Educação</option>
              <option value="Saúde">Saúde</option>
            </select>
          </div>
          <div className="flex space-x-3 pt-4">
            <button
              onClick={() => setShowModal(false)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleAddGoal}
              className="flex-1 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg font-semibold"
            >
              Adicionar
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal para adicionar valor */}
      <Modal
        isOpen={showAddValueModal && selectedGoal !== null}
        onClose={() => {
          setShowAddValueModal(false)
          setSelectedGoal(null)
          setAddValueAmount('')
        }}
        title="Adicionar Valor ao Objetivo"
      >
        <p className="text-sm text-gray-600 mb-4">Objetivo: <span className="font-semibold">{selectedGoal?.nome}</span></p>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Valor a Adicionar (€)</label>
            <input
              type="number"
              step="0.01"
              value={addValueAmount}
              onChange={(e) => setAddValueAmount(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="0.00"
            />
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Valor Atual:</span>
              <span className="font-semibold text-gray-900">{formatCurrency(selectedGoal?.valorAtual || 0)}</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-gray-600">Novo Valor:</span>
              <span className="font-bold text-primary">
                {formatCurrency((selectedGoal?.valorAtual || 0) + (parseFloat(addValueAmount) || 0))}
              </span>
            </div>
          </div>
          <div className="flex space-x-3 pt-4">
            <button
              onClick={() => {
                setShowAddValueModal(false)
                setSelectedGoal(null)
                setAddValueAmount('')
              }}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleAddValue}
              className="flex-1 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg font-semibold"
            >
              Adicionar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default SavingsGoals

