import React, { useState, useEffect, useCallback } from 'react'
import { apiFetch } from '../../config/api'
import { LoadingSpinner } from '../Skeleton'

const PRESET_SERVICES = [
    { name: 'Netflix', color: '#E50914' },
    { name: 'Spotify', color: '#1DB954' },
    { name: 'YouTube Premium', color: '#FF0000' },
    { name: 'Amazon Prime', color: '#00A8E0' },
    { name: 'Disney+', color: '#113CCF' },
    { name: 'Apple TV+', color: '#000000' },
    { name: 'HBO Max', color: '#5822B4' },
    { name: 'PlayStation Plus', color: '#003791' },
    { name: 'Xbox Game Pass', color: '#107C10' },
    { name: 'Adobe Creative', color: '#FF0000' },
    { name: 'Microsoft 365', color: '#D83B01' },
    { name: 'Dropbox', color: '#0061FF' },
    { name: 'Ginásio', color: '#F97316' },
    { name: 'NOS', color: '#E2001A' },
    { name: 'MEO', color: '#00AEEF' },
    { name: 'Vodafone', color: '#E60000' },
    { name: 'Outro', color: '#64748B' },
]

const CATEGORIES = ['Entretenimento', 'Música', 'Desporto', 'Telecomunicações', 'Software', 'Serviços', 'Saúde', 'Outro']

function DaysUntilBadge({ days }) {
    if (days === 0) return <span className="text-xs font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded-full">Débita hoje</span>
    if (days <= 3) return <span className="text-xs font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded-full">Em {days} dias</span>
    if (days <= 7) return <span className="text-xs font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Em {days} dias</span>
    return <span className="text-xs font-medium bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Em {days} dias</span>
}

function AddSubscriptionModal({ onSave, onClose }) {
    const [form, setForm] = useState({ name: '', amount: '', billing_day: '', category: 'Serviços', is_active: true, color: '#3B82F6' })
    const [saving, setSaving] = useState(false)

    const handlePreset = (preset) => setForm(f => ({ ...f, name: preset.name, color: preset.color }))

    const handleSave = async () => {
        if (!form.name || !form.amount || !form.billing_day) return
        setSaving(true)
        try {
            await apiFetch('/api/subscriptions', { method: 'POST', body: JSON.stringify({ ...form, amount: parseFloat(form.amount), billing_day: parseInt(form.billing_day) }) })
            onSave()
        } catch (e) { console.error(e) } finally { setSaving(false) }
    }

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 my-4">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Nova Subscrição</h3>

                {/* Serviços Comuns */}
                <p className="text-xs font-semibold text-slate-500 mb-2">Serviços Comuns</p>
                <div className="flex flex-wrap gap-2 mb-4 max-h-24 overflow-y-auto">
                    {PRESET_SERVICES.map(p => (
                        <button
                            key={p.name}
                            onClick={() => handlePreset(p)}
                            className={`text-xs px-2.5 py-1 rounded-full border font-medium transition-all hover:opacity-80 ${form.name === p.name ? 'ring-2' : ''}`}
                            style={{ borderColor: p.color + '88', color: p.color }}
                        >
                            {p.name}
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="col-span-2">
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Nome</label>
                        <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="ex: Netflix" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Valor Mensal (€)</label>
                        <input type="number" min="0.01" step="0.01" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="9.99" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Dia do Mês</label>
                        <input type="number" min="1" max="31" value={form.billing_day} onChange={e => setForm(f => ({ ...f, billing_day: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="1" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Categoria</label>
                        <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Cor</label>
                        <input type="color" value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))} className="w-full h-10 rounded-xl border border-gray-200 cursor-pointer" />
                    </div>
                </div>

                <div className="flex gap-3">
                    <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-slate-600 font-semibold hover:bg-gray-50">Cancelar</button>
                    <button onClick={handleSave} disabled={saving || !form.name || !form.amount || !form.billing_day} className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 disabled:opacity-50">
                        {saving ? 'A guardar…' : 'Guardar'}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default function Subscriptions() {
    const [subscriptions, setSubscriptions] = useState([])
    const [totalMonthly, setTotalMonthly] = useState(0)
    const [loading, setLoading] = useState(true)
    const [showAddModal, setShowAddModal] = useState(false)

    const fetchSubs = useCallback(async () => {
        setLoading(true)
        try {
            const data = await apiFetch('/api/subscriptions')
            setSubscriptions(data.subscriptions || [])
            setTotalMonthly(data.total_monthly || 0)
        } catch (e) { console.error(e) } finally { setLoading(false) }
    }, [])

    useEffect(() => { fetchSubs() }, [fetchSubs])

    const handleDelete = async (id) => {
        if (!confirm('Remover esta subscrição?')) return
        try {
            await apiFetch(`/api/subscriptions/${id}`, { method: 'DELETE' })
            fetchSubs()
        } catch (e) { console.error(e) }
    }

    const handleToggle = async (sub) => {
        try {
            await apiFetch(`/api/subscriptions/${sub.id}`, { method: 'PUT', body: JSON.stringify({ is_active: !sub.is_active }) })
            fetchSubs()
        } catch (e) { console.error(e) }
    }

    if (loading) return <LoadingSpinner />

    const active = subscriptions.filter(s => s.is_active)
    const paused = subscriptions.filter(s => !s.is_active)
    const nextBilling = [...active].sort((a, b) => a.days_until - b.days_until)[0]

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">Finanças</p>
                    <h2 className="text-2xl font-bold text-gray-900">Subscrições</h2>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-md"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                    Adicionar
                </button>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                    <p className="text-xs text-gray-500">Total Mensal</p>
                    <p className="text-2xl font-bold text-slate-900">€{totalMonthly.toFixed(2)}</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                    <p className="text-xs text-gray-500">Subscrições Ativas</p>
                    <p className="text-2xl font-bold text-slate-900">{active.length}</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                    <p className="text-xs text-gray-500">Total Anual (est)</p>
                    <p className="text-2xl font-bold text-slate-900">€{(totalMonthly * 12).toFixed(0)}</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                    <p className="text-xs text-gray-500">Próximo Débito</p>
                    <p className="text-lg font-bold text-slate-900">{nextBilling ? `${nextBilling.name} (${nextBilling.days_until}d)` : '—'}</p>
                </div>
            </div>

            {/* Active Subscriptions */}
            {active.length > 0 && (
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <div className="w-2 h-6 bg-primary rounded-full" />
                        Ativas ({active.length})
                    </h3>
                    <div className="divide-y divide-gray-50">
                        {active.map(sub => (
                            <div key={sub.id} className="flex items-center justify-between py-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-sm" style={{ backgroundColor: sub.color }}>
                                        {sub.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900 text-sm">{sub.name}</p>
                                        <p className="text-xs text-slate-500">Dia {sub.billing_day} de cada mês · {sub.category}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <DaysUntilBadge days={sub.days_until} />
                                    <p className="text-base font-bold text-slate-900">€{sub.amount.toFixed(2)}</p>
                                    <button onClick={() => handleToggle(sub)} className="text-xs text-amber-600 hover:underline font-medium">Pausar</button>
                                    <button onClick={() => handleDelete(sub.id)} className="text-xs text-red-500 hover:underline font-medium">Remover</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Paused */}
            {paused.length > 0 && (
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm opacity-70">
                    <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                        <div className="w-2 h-6 bg-primary/40 rounded-full" />
                        Pausadas ({paused.length})
                    </h3>
                    <div className="divide-y divide-gray-50">
                        {paused.map(sub => (
                            <div key={sub.id} className="flex items-center justify-between py-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white text-sm grayscale" style={{ backgroundColor: sub.color }}>
                                        {sub.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-600 text-sm">{sub.name}</p>
                                        <p className="text-xs text-slate-400">€{sub.amount.toFixed(2)}/mês</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button onClick={() => handleToggle(sub)} className="text-xs text-emerald-600 hover:underline font-medium">Ativar</button>
                                    <button onClick={() => handleDelete(sub.id)} className="text-xs text-red-500 hover:underline font-medium">Remover</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {subscriptions.length === 0 && (
                <div className="text-center py-16 text-slate-400">
                    <p className="text-4xl mb-3">📋</p>
                    <p className="font-semibold text-base">Ainda não tens subscrições registadas</p>
                    <p className="text-sm">Adiciona o Netflix, Spotify ou qualquer serviço recorrente</p>
                </div>
            )}

            {showAddModal && <AddSubscriptionModal onSave={() => { setShowAddModal(false); fetchSubs() }} onClose={() => setShowAddModal(false)} />}
        </div>
    )
}
