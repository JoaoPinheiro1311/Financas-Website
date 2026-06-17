import { useState, useEffect } from 'react'
import { useToast } from '../Toast'
import { motion, AnimatePresence } from 'framer-motion'

// Chave do localStorage
const STORAGE_KEY = 'financelog_debts'

const DEBT_TYPES = [
  { value: 'credit_card', label: '💳 Cartão de Crédito', color: '#EF4444' },
  { value: 'mortgage', label: '🏠 Habitação / Hipoteca', color: '#3B82F6' },
  { value: 'car', label: '🚗 Automóvel', color: '#F59E0B' },
  { value: 'student', label: '🎓 Estudantil', color: '#8B5CF6' },
  { value: 'personal', label: '👤 Pessoal', color: '#6B7280' },
  { value: 'other', label: '📋 Outro', color: '#10B981' },
]

function getTypeInfo(type) {
  return DEBT_TYPES.find(t => t.value === type) || DEBT_TYPES[4]
}

function formatCurrency(value) {
  return new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(value || 0)
}

// Helpers localStorage
function loadDebts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function saveDebts(debts) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(debts))
}

// Exportar função utilitária para outros componentes lerem o total de dívidas
export function getTotalDebt() {
  const debts = loadDebts()
  return debts.reduce((sum, d) => sum + (parseFloat(d.remaining_amount) || 0), 0)
}

function AddDebtModal({ onSave, onClose }) {
  const [form, setForm] = useState({
    name: '', type: 'personal', total_amount: '', remaining_amount: '',
    interest_rate: '', monthly_payment: '', due_date: '', creditor: '', notes: ''
  })
  const { showToast } = useToast()

  const handleSave = () => {
    if (!form.name || !form.total_amount || !form.remaining_amount) {
      showToast('Preencha pelo menos o nome, valor total e valor em dívida', 'warning')
      return
    }
    const debt = {
      id: Date.now(),
      ...form,
      total_amount: parseFloat(form.total_amount) || 0,
      remaining_amount: parseFloat(form.remaining_amount) || 0,
      interest_rate: parseFloat(form.interest_rate) || 0,
      monthly_payment: parseFloat(form.monthly_payment) || 0,
      created_at: new Date().toISOString(),
    }
    const current = loadDebts()
    saveDebts([...current, debt])
    showToast('Dívida registada com sucesso!', 'success')
    onSave()
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-slate-900">Nova Dívida</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tipo */}
        <div className="mb-4">
          <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Tipo</label>
          <div className="grid grid-cols-3 gap-2">
            {DEBT_TYPES.map(t => (
              <button key={t.value} onClick={() => setForm(f => ({ ...f, type: t.value }))}
                className={`px-2 py-2 rounded-xl text-xs font-bold border-2 transition-all ${form.type === t.value ? 'border-current' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
                style={form.type === t.value ? { borderColor: t.color, color: t.color, backgroundColor: t.color + '15' } : {}}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Nome / Descrição *</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="ex: Crédito Pessoal BPI" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Credor / Banco</label>
              <input value={form.creditor} onChange={e => setForm(f => ({ ...f, creditor: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="ex: BPI, CGD..." />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Taxa de Juro (% a.a.)</label>
              <input type="number" step="0.1" min="0" value={form.interest_rate}
                onChange={e => setForm(f => ({ ...f, interest_rate: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="5.5" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Valor Total Emprestado (€) *</label>
              <input type="number" step="0.01" min="0" value={form.total_amount}
                onChange={e => setForm(f => ({ ...f, total_amount: e.target.value, remaining_amount: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="10000" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Valor em Dívida Atual (€) *</label>
              <input type="number" step="0.01" min="0" value={form.remaining_amount}
                onChange={e => setForm(f => ({ ...f, remaining_amount: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="8500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Prestação Mensal (€)</label>
              <input type="number" step="0.01" min="0" value={form.monthly_payment}
                onChange={e => setForm(f => ({ ...f, monthly_payment: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="250" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Data de Fim</label>
              <input type="date" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-slate-600 font-semibold hover:bg-gray-50 transition-colors">
            Cancelar
          </button>
          <button onClick={handleSave}
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 transition-colors">
            Guardar Dívida
          </button>
        </div>
      </motion.div>
    </div>
  )
}

function PaymentModal({ debt, onSave, onClose }) {
  const [amount, setAmount] = useState(String(debt.monthly_payment || ''))
  const { showToast } = useToast()

  const handlePay = () => {
    const payValue = parseFloat(amount)
    if (!payValue || payValue <= 0) { showToast('Valor inválido', 'warning'); return }
    const newRemaining = Math.max(0, debt.remaining_amount - payValue)
    const debts = loadDebts()
    saveDebts(debts.map(d => d.id === debt.id ? { ...d, remaining_amount: newRemaining } : d))
    showToast(`Pagamento de ${formatCurrency(payValue)} registado! ✅`, 'success')
    onSave()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-1">Registar Pagamento</h3>
        <p className="text-sm text-slate-500 mb-4">{debt.name}</p>
        <div className="bg-slate-50 rounded-xl p-4 mb-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Em dívida:</span>
            <span className="font-bold text-red-600">{formatCurrency(debt.remaining_amount)}</span>
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-xs font-semibold text-slate-600 mb-1">Valor do Pagamento (€)</label>
          <input type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div className="flex gap-3">
          <button onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-slate-600 font-semibold hover:bg-gray-50">Cancelar</button>
          <button onClick={handlePay}
            className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700">Confirmar</button>
        </div>
      </motion.div>
    </div>
  )
}

export default function Debts() {
  const [debts, setDebts] = useState([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [payingDebt, setPayingDebt] = useState(null)
  const { showToast } = useToast()

  const refresh = () => setDebts(loadDebts())

  useEffect(() => { refresh() }, [])

  const handleDelete = (id) => {
    if (!confirm('Remover esta dívida?')) return
    saveDebts(loadDebts().filter(d => d.id !== id))
    showToast('Dívida removida', 'success')
    refresh()
  }

  const totalDebt = debts.reduce((s, d) => s + (d.remaining_amount || 0), 0)
  const totalMonthly = debts.reduce((s, d) => s + (d.monthly_payment || 0), 0)
  const paidOff = debts.filter(d => d.remaining_amount <= 0).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">Finanças</p>
          <h2 className="text-2xl font-bold text-gray-900">Gestão de Dívidas</h2>
        </div>
        <button onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-md">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Registar Dívida
        </button>
      </div>

      {/* Info banner — dados locais */}
      <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
        <svg className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-xs text-blue-700 font-medium">
          Os dados de dívidas são guardados localmente neste dispositivo e integram-se na métrica de Saúde Financeira.
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-500 mb-1">Total em Dívida</p>
          <p className="text-2xl font-black text-red-600">{formatCurrency(totalDebt)}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-500 mb-1">Prestações/Mês</p>
          <p className="text-2xl font-black text-slate-900">{formatCurrency(totalMonthly)}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-500 mb-1">Dívidas Ativas</p>
          <p className="text-2xl font-black text-slate-900">{debts.filter(d => d.remaining_amount > 0).length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-500 mb-1">Liquidadas</p>
          <p className="text-2xl font-black text-emerald-600">{paidOff}</p>
        </div>
      </div>

      {/* Debt List */}
      {debts.length === 0 ? (
        <div className="bg-white rounded-2xl p-16 text-center shadow-sm border border-gray-100">
          <div className="text-5xl mb-4">🎉</div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Sem dívidas registadas!</h3>
          <p className="text-slate-500 mb-6">Regista os teus créditos e empréstimos para acompanhar o progresso de pagamento.</p>
          <button onClick={() => setShowAddModal(true)}
            className="bg-slate-900 text-white px-6 py-3 rounded-xl font-semibold hover:bg-slate-800 transition-colors">
            Registar Primeira Dívida
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <AnimatePresence>
            {debts.map((debt, i) => {
              const typeInfo = getTypeInfo(debt.type)
              const paidPercent = debt.total_amount > 0
                ? Math.min(100, ((debt.total_amount - debt.remaining_amount) / debt.total_amount) * 100)
                : 0
              const isPaid = debt.remaining_amount <= 0

              return (
                <motion.div key={debt.id}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`bg-white rounded-2xl p-6 border shadow-sm hover:shadow-md transition-all ${isPaid ? 'border-emerald-200 bg-emerald-50/30' : 'border-gray-100'}`}>

                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold text-white"
                        style={{ backgroundColor: typeInfo.color }}>
                        {debt.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{debt.name}</p>
                        <p className="text-xs text-slate-500">{debt.creditor || typeInfo.label}</p>
                      </div>
                    </div>
                    {isPaid && (
                      <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-bold">✓ Liquidada</span>
                    )}
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                      <span>Progresso de pagamento</span>
                      <span className="font-bold">{paidPercent.toFixed(0)}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }} animate={{ width: `${paidPercent}%` }}
                        transition={{ duration: 1, delay: i * 0.1 }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: isPaid ? '#10B981' : typeInfo.color }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div>
                      <p className="text-xs text-slate-500">Em dívida</p>
                      <p className="text-lg font-black text-red-600">{formatCurrency(debt.remaining_amount)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Total original</p>
                      <p className="text-lg font-bold text-slate-700">{formatCurrency(debt.total_amount)}</p>
                    </div>
                    {debt.monthly_payment > 0 && (
                      <div>
                        <p className="text-xs text-slate-500">Prestação</p>
                        <p className="text-sm font-bold text-slate-900">{formatCurrency(debt.monthly_payment)}/mês</p>
                      </div>
                    )}
                    {debt.interest_rate > 0 && (
                      <div>
                        <p className="text-xs text-slate-500">Taxa de Juro</p>
                        <p className="text-sm font-bold text-amber-600">{debt.interest_rate}% a.a.</p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 pt-4 border-t border-gray-100">
                    {!isPaid && (
                      <button onClick={() => setPayingDebt(debt)}
                        className="flex-1 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-xl transition-colors">
                        💸 Registar Pagamento
                      </button>
                    )}
                    <button onClick={() => handleDelete(debt.id)}
                      className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold rounded-xl transition-colors">
                      Remover
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}

      <AnimatePresence>
        {showAddModal && <AddDebtModal onSave={() => { setShowAddModal(false); refresh() }} onClose={() => setShowAddModal(false)} />}
        {payingDebt && <PaymentModal debt={payingDebt} onSave={() => { setPayingDebt(null); refresh() }} onClose={() => setPayingDebt(null)} />}
      </AnimatePresence>
    </div>
  )
}
