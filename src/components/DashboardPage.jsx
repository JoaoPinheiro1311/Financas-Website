import { useState, useEffect } from 'react'
import { LoadingSpinner } from './Skeleton'
import { apiFetch } from '../config/api'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import SavingsGoals from './dashboard/SavingsGoals'
import FinancialActivity from './dashboard/FinancialActivity'
import FinancialHealth from './dashboard/FinancialHealth'
import StockInvestments from './dashboard/StockInvestments'
import AddTransaction from './dashboard/AddTransaction'
import Profile from './dashboard/Profile'
import Subscriptions from './dashboard/Subscriptions'
import ExportReports from './dashboard/ExportReports'
import FinanceAIChatbot from './FinanceAIChatbot'

function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [userData, setUserData] = useState(null)
  const [activeTab, setActiveTab] = useState('activity')
  const [sidebarOpen, setSidebarOpen] = useState(false)
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
    {
      id: 'activity', name: 'Atividade', icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
      )
    },
    {
      id: 'savings', name: 'Objetivos', icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
      )
    },
    {
      id: 'health', name: 'Saúde Financeira', icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
      )
    },
    {
      id: 'investments', name: 'Investimentos', icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
      )
    },
    {
      id: 'subscriptions', name: 'Subscrições', icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
      )
    },
    {
      id: 'export', name: 'Exportar', icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
      )
    },
    {
      id: 'add', name: 'Registar', icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 4v16m8-8H4" /></svg>
      )
    },
    {
      id: 'profile', name: 'Definições', icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.573-1.066z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
      )
    },
  ]

  const activeTabData = tabs.find(t => t.id === activeTab)

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <LoadingSpinner className="h-16 w-16" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex bg-slate-100">
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-slate-900 text-white flex flex-col transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        {/* Logo */}
        <div className="flex items-center px-6 py-8 border-b border-white/5">
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-black tracking-tighter uppercase">Finance</span>
            <span className="text-xl font-light text-primary uppercase">Log</span>
          </div>
        </div>


        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto custom-scrollbar">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id)
                  setSidebarOpen(false)
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${isActive
                  ? 'bg-primary text-white shadow-lg'
                  : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  }`}
              >
                {tab.icon}
                <span>{tab.name}</span>
              </button>
            )
          })}
        </nav>

        {/* User info */}
        <div className="px-6 py-6 border-t border-white/5 mx-2">
          <div className="overflow-hidden">
            <p className="text-sm font-bold text-slate-100 truncate">{userData?.display_name || 'Utilizador'}</p>
            <p className="text-[10px] text-slate-500 truncate font-medium">{userData?.email || ''}</p>
          </div>
        </div>

        {/* Logout */}
        <div className="px-4 py-5 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-400 hover:bg-red-500/20 hover:text-red-400 transition-all duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Sair</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-h-screen lg:ml-0">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-200/80 px-6 py-4">
          <div className="flex items-center justify-between mx-auto">
            <div className="flex items-center gap-4">
              {/* Mobile hamburger */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 -ml-2 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  {activeTabData?.name || 'Dashboard'}
                </h1>
                <p className="text-sm text-slate-400 mt-0.5">
                  Olá, <span className="font-semibold text-slate-600">{userData?.display_name || 'Utilizador'}</span>
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6 lg:p-10 mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              {activeTab === 'activity' && <FinancialActivity userData={userData} />}
              {activeTab === 'savings' && <SavingsGoals userData={userData} />}
              {activeTab === 'health' && <FinancialHealth userData={userData} />}
              {activeTab === 'investments' && <StockInvestments userData={userData} />}
              {activeTab === 'subscriptions' && <Subscriptions userData={userData} />}
              {activeTab === 'export' && <ExportReports />}
              {activeTab === 'add' && <AddTransaction userData={userData} />}
              {activeTab === 'profile' && <Profile userData={userData} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Finance AI Chatbot */}
      <FinanceAIChatbot />
    </div>
  )
}

export default DashboardPage
