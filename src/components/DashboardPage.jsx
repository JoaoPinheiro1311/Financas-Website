import { useState, useEffect } from 'react'
import { apiFetch, API_BASE_URL } from '../config/api'
import { useNavigate } from 'react-router-dom'
import Header from './Header'
import SavingsGoals from './dashboard/SavingsGoals'
import FinancialActivity from './dashboard/FinancialActivity'
import FinancialHealth from './dashboard/FinancialHealth'
import StockInvestments from './dashboard/StockInvestments'
import AddTransaction from './dashboard/AddTransaction'
import Profile from './dashboard/Profile'
import FinanceAIChatbot from './FinanceAIChatbot'

function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [userData, setUserData] = useState(null)
  const [activeTab, setActiveTab] = useState('activity')
  const navigate = useNavigate()

  useEffect(() => {
    checkLoginStatus()
  }, [])

  const checkLoginStatus = async () => {
    try {
      const response = await apiFetch('/api/dashboard', {
        method: 'GET',
        credentials: 'include',
      })

      if (response.ok) {
        const data = await response.json()
        setUserData(data)
        setLoading(false)
      } else if (response.status === 401) {
        navigate('/login')
      } else {
        setLoading(false)
      }
    } catch (err) {
      console.error('Error checking login status:', err)
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      const response = await apiFetch('/api/logout', {
        method: 'POST',
        credentials: 'include',
      })

      if (response.ok) {
        setUserData(null)
        navigate('/')
      }
    } catch (err) {
      console.error('Error logging out:', err)
    }
  }

  const tabs = [
    { id: 'activity', name: 'Resumo da Atividade', icon: '📊', hint: 'Visão geral dos fluxos e saldo' },
    { id: 'savings', name: 'Objetivos de Poupança', icon: '🎯', hint: 'Metas, progresso e contribuições' },
    { id: 'health', name: 'Saúde Financeira', icon: '💚', hint: 'Score, alertas e recomendações' },
    { id: 'investments', name: 'Investimentos', icon: '📈', hint: 'Ações, ETFs e desempenho' },
    { id: 'add', name: 'Adicionar Transação', icon: '➕', hint: 'Nova receita, despesa ou ajuste' },
    { id: 'profile', name: 'Configurações', icon: '👤', hint: 'Perfil, preferências e segurança' },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="mt-16 md:mt-20 flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">A carregar...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Header />
      <div className="mt-16 md:mt-20 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                  Olá, {userData?.display_name || 'Utilizador'}!
                </h1>
                <p className="text-gray-600">Bem-vindo de volta à sua dashboard</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="hidden sm:inline">Sair</span>
              </button>
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {tabs.map((tab) => {
                  const isActive = activeTab === tab.id
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`group flex h-full items-start gap-3 rounded-lg border px-4 py-3 text-left transition-all duration-150 ${
                        isActive
                          ? 'border-primary/50 bg-primary/10 text-gray-900 shadow-sm'
                          : 'border-transparent bg-gray-50 hover:bg-white hover:border-gray-200 text-gray-700'
                      }`}
                    >
                      <span className={`text-xl h-10 w-10 flex items-center justify-center rounded-md ${isActive ? 'bg-primary text-white' : 'bg-white text-gray-800 border border-gray-200'}`}>
                        {tab.icon}
                      </span>
                      <div className="flex flex-col text-left">
                        <span className="font-semibold leading-tight">{tab.name}</span>
                        <span className="text-xs text-gray-500 leading-tight">{tab.hint}</span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Tab Content */}
          <div className="animate-fade-in">
            {activeTab === 'activity' && <FinancialActivity userData={userData} />}
            {activeTab === 'savings' && <SavingsGoals userData={userData} />}
            {activeTab === 'health' && <FinancialHealth userData={userData} />}
            {activeTab === 'investments' && <StockInvestments userData={userData} />}
            {activeTab === 'add' && <AddTransaction userData={userData} />}
            {activeTab === 'profile' && <Profile userData={userData} />}
          </div>
        </div>
      </div>
      
      {/* Finance AI Chatbot */}
      <FinanceAIChatbot />
    </div>
  )
}

export default DashboardPage
