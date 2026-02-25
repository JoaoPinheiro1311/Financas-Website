import React, { useState, useEffect, useCallback } from 'react'
import { apiFetch } from '../../config/api'
import { LoadingSpinner } from '../Skeleton'

const CATEGORY_ICONS = {
    'Alimentação': '🛒', 'Transporte': '🚗', 'Saúde': '💊',
    'Lazer': '🎮', 'Educação': '📚', 'Casa': '🏠', 'Roupa': '👕',
    'Tecnologia': '💻', 'Viagens': '✈️', 'Outros': '📦',
}

function BudgetBar({ percent }) {
    const color = percent >= 100 ? 'bg-red-500' : percent >= 70 ? 'bg-amber-400' : 'bg-emerald-500'
    return (
        <div className="w-full bg-gray-100 rounded-full h-2 mt-2">
            <div
                className={`${color} rounded-full h-2 transition-all duration-500`}
                style={{ width: `${Math.min(percent, 100)}%` }}
            />
        </div>
    )
}

function SetBudgetModal({ category, existing, month, onSave, onClose }) {
    const [amount, setAmount] = useState(existing?.amount ?? '')
    const [saving, setSaving] = useState(false)

    const handleSave = async () => {
        if (!amount || isNaN(amount) || parseFloat(amount) <= 0) return
        setSaving(true)
        try {
            await apiFetch('/api/budgets', {
                method: 'POST',
                body: JSON.stringify({ category, amount: parseFloat(amount), month }),
            })
            onSave()
        } catch (e) {
            console.error(e)
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-1">Definir Orçamento</h3>
                <p className="text-sm text-slate-500 mb-5">Categoria: <strong>{category}</strong> — {month}</p>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Limite Mensal (€)</label>
                <input
                    type="number"
                    min="1"
                    step="0.01"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-5"
                    placeholder="ex: 300"
                    autoFocus
                />
                <div className="flex gap-3">
                    <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-slate-600 font-semibold hover:bg-gray-50 transition-all">Cancelar</button>
                    <button onClick={handleSave} disabled={saving} className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 transition-all disabled:opacity-50">
                        {saving ? 'A guardar…' : 'Guardar'}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default function Budgets() {
    const [budgets, setBudgets] = useState([])
    const [unbudgeted, setUnbudgeted] = useState([])
    const [loading, setLoading] = useState(true)
    const [month, setMonth] = useState(() => {
        const d = new Date()
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    })
    const [modal, setModal] = useState(null) // { category, existing }

    const fetchBudgets = useCallback(async () => {
        setLoading(true)
        try {
            const data = await apiFetch(`/api/budgets?month=${month}`)
            setBudgets(data.budgets || [])
            setUnbudgeted(data.unbudgeted || [])
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }, [month])

    useEffect(() => { fetchBudgets() }, [fetchBudgets])

    const handleDelete = async (id) => {
        try {
            await apiFetch(`/api/budgets/${id}`, { method: 'DELETE' })
            fetchBudgets()
        } catch (e) { console.error(e) }
    }

    const overBudget = budgets.filter(b => b.percent >= 100).length
    const totalBudgeted = budgets.reduce((s, b) => s + b.amount, 0)
    const totalSpent = budgets.reduce((s, b) => s + b.spent, 0)

    if (loading) return <LoadingSpinner />

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Finanças</p>
                    <h2 className="text-2xl font-bold text-gray-900">Orçamentos Mensais</h2>
                </div>
                <div className="flex items-center gap-3">
                    <input
                        type="month"
                        value={month}
                        onChange={e => setMonth(e.target.value)}
                        className="border border-gray-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        onClick={() => setModal({ category: '', existing: null, isNew: true })}
                        className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-md"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                        Novo Orçamento
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                    <p className="text-xs text-gray-500">Orçamentos Ativos</p>
                    <p className="text-2xl font-bold text-slate-900">{budgets.length}</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                    <p className="text-xs text-gray-500">Total Orçamentado</p>
                    <p className="text-2xl font-bold text-slate-900">€{totalBudgeted.toFixed(0)}</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                    <p className="text-xs text-gray-500">Total Gasto</p>
                    <p className="text-2xl font-bold text-slate-900">€{totalSpent.toFixed(0)}</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                    <p className="text-xs text-gray-500">Orçamentos Excedidos</p>
                    <p className={`text-2xl font-bold ${overBudget > 0 ? 'text-red-500' : 'text-emerald-600'}`}>{overBudget}</p>
                </div>
            </div>

            {/* Budget Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {budgets.map(b => (
                    <div key={b.id} className={`bg-white rounded-xl p-5 border shadow-sm transition-all ${b.percent >= 100 ? 'border-red-200' : b.percent >= 70 ? 'border-amber-200' : 'border-gray-100'}`}>
                        <div className="flex items-start justify-between mb-1">
                            <div className="flex items-center gap-2">
                                <span className="text-xl">{CATEGORY_ICONS[b.category] || '📦'}</span>
                                <div>
                                    <p className="font-bold text-slate-900 text-sm">{b.category}</p>
                                    <p className="text-xs text-slate-500">€{b.spent.toFixed(2)} / €{b.amount.toFixed(2)}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${b.percent >= 100 ? 'bg-red-100 text-red-600' : b.percent >= 70 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                    {b.percent.toFixed(0)}%
                                </span>
                            </div>
                        </div>
                        <BudgetBar percent={b.percent} />
                        <div className="flex justify-end gap-2 mt-3">
                            <button onClick={() => setModal({ category: b.category, existing: b })} className="text-xs text-blue-600 hover:underline font-medium">Editar</button>
                            <button onClick={() => handleDelete(b.id)} className="text-xs text-red-500 hover:underline font-medium">Remover</button>
                        </div>
                    </div>
                ))}

                {budgets.length === 0 && unbudgeted.length === 0 && (
                    <div className="col-span-full text-center py-12 text-slate-400">
                        <p className="text-4xl mb-3">📊</p>
                        <p className="font-semibold">Ainda não tens orçamentos para {month}</p>
                        <p className="text-sm">Clica em "Novo Orçamento" para começar</p>
                    </div>
                )}
            </div>

            {/* Unbudgeted categories */}
            {unbudgeted.length > 0 && (
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <div className="w-2 h-6 bg-slate-400 rounded-full" />
                        Categorias sem Orçamento Definido
                    </h3>
                    <div className="divide-y divide-gray-50">
                        {unbudgeted.map(u => (
                            <div key={u.category} className="flex items-center justify-between py-3">
                                <div className="flex items-center gap-2">
                                    <span>{CATEGORY_ICONS[u.category] || '📦'}</span>
                                    <span className="text-sm font-medium text-slate-700">{u.category}</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-sm font-bold text-slate-900">€{u.spent.toFixed(2)}</span>
                                    <button
                                        onClick={() => setModal({ category: u.category, existing: null })}
                                        className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg font-semibold transition-all"
                                    >
                                        Definir Limite
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Modal */}
            {modal && (
                modal.isNew ? (
                    <NewCategoryBudgetModal month={month} onSave={() => { setModal(null); fetchBudgets() }} onClose={() => setModal(null)} />
                ) : (
                    <SetBudgetModal category={modal.category} existing={modal.existing} month={month} onSave={() => { setModal(null); fetchBudgets() }} onClose={() => setModal(null)} />
                )
            )}
        </div>
    )
}

function NewCategoryBudgetModal({ month, onSave, onClose }) {
    const [category, setCategory] = useState('')
    const [amount, setAmount] = useState('')
    const [saving, setSaving] = useState(false)
    const categories = Object.keys(CATEGORY_ICONS)

    const handleSave = async () => {
        if (!category || !amount || parseFloat(amount) <= 0) return
        setSaving(true)
        try {
            await apiFetch('/api/budgets', { method: 'POST', body: JSON.stringify({ category, amount: parseFloat(amount), month }) })
            onSave()
        } catch (e) { console.error(e) } finally { setSaving(false) }
    }

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Novo Orçamento</h3>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Categoria</label>
                <select value={category} onChange={e => setCategory(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-slate-900 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Selecionar…</option>
                    {categories.map(c => <option key={c} value={c}>{CATEGORY_ICONS[c]} {c}</option>)}
                </select>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Limite Mensal (€)</label>
                <input type="number" min="1" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-slate-900 mb-5 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="ex: 300" />
                <div className="flex gap-3">
                    <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-slate-600 font-semibold hover:bg-gray-50 transition-all">Cancelar</button>
                    <button onClick={handleSave} disabled={saving || !category} className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 transition-all disabled:opacity-50">
                        {saving ? 'A guardar…' : 'Guardar'}
                    </button>
                </div>
            </div>
        </div>
    )
}
