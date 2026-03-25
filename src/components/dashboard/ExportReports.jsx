import { useState } from 'react'
import { SERVICES } from '../../config/api'
const API_BASE = SERVICES.FINANCE

const PERIODS = [
    {
        label: 'Este Mês', getValue: () => {
            const d = new Date()
            const start = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
            const end = new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().split('T')[0]
            return { start, end }
        }
    },
    {
        label: 'Mês Passado', getValue: () => {
            const d = new Date()
            d.setMonth(d.getMonth() - 1)
            const start = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
            const end = new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().split('T')[0]
            return { start, end }
        }
    },
    {
        label: 'Último Trimestre', getValue: () => {
            const d = new Date()
            const end = d.toISOString().split('T')[0]
            d.setMonth(d.getMonth() - 3)
            const start = d.toISOString().split('T')[0]
            return { start, end }
        }
    },
    {
        label: 'Este Ano', getValue: () => {
            const d = new Date()
            return { start: `${d.getFullYear()}-01-01`, end: d.toISOString().split('T')[0] }
        }
    },
    { label: 'Personalizado', getValue: () => null },
]

export default function ExportReports() {
    const [selectedPeriod, setSelectedPeriod] = useState(0)
    const [customStart, setCustomStart] = useState('')
    const [customEnd, setCustomEnd] = useState('')
    const [exporting, setExporting] = useState(null) // 'csv' | 'pdf'

    const getDateRange = () => {
        if (selectedPeriod === 4) return { start: customStart, end: customEnd }
        return PERIODS[selectedPeriod].getValue()
    }

    const { start, end } = getDateRange() || {}

    const handleExport = async (type) => {
        if (!start || !end) return
        setExporting(type)
        try {
            const url = `${API_BASE}/export/${type}?start_date=${start}&end_date=${end}`
            const resp = await fetch(url, { credentials: 'include' })
            if (!resp.ok) throw new Error(await resp.text())

            const blob = await resp.blob()
            const link = document.createElement('a')
            link.href = URL.createObjectURL(blob)
            link.download = `relatorio_${start}_${end}.${type}`
            link.click()
            URL.revokeObjectURL(link.href)
        } catch (e) {
            console.error('Erro ao exportar:', e)
            alert('Erro ao exportar. Verifica a consola para mais detalhes.')
        } finally {
            setExporting(null)
        }
    }

    const isValid = start && end && start <= end

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">Finanças</p>
                <h2 className="text-2xl font-bold text-gray-900">Exportar Relatórios</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Period Selector */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <div className="w-2 h-6 bg-primary rounded-full" />
                        Selecionar Período
                    </h3>
                    <div className="space-y-2 mb-4">
                        {PERIODS.map((p, i) => (
                            <button
                                key={i}
                                onClick={() => setSelectedPeriod(i)}
                                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all ${selectedPeriod === i
                                    ? 'bg-slate-900 text-white shadow-md'
                                    : 'bg-gray-50 text-slate-700 hover:bg-gray-100'
                                    }`}
                            >
                                {p.label}
                            </button>
                        ))}
                    </div>

                    {selectedPeriod === 4 && (
                        <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-gray-100">
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1">Data de Início</label>
                                <input type="date" value={customStart} onChange={e => setCustomStart(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1">Data de Fim</label>
                                <input type="date" value={customEnd} onChange={e => setCustomEnd(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                        </div>
                    )}

                    {isValid && (
                        <div className="mt-4 pt-4 border-t border-gray-100 text-sm text-slate-500">
                            Período selecionado: <strong className="text-slate-800">{start}</strong> → <strong className="text-slate-800">{end}</strong>
                        </div>
                    )}
                </div>

                {/* Export Options */}
                <div className="space-y-4">
                    {/* CSV Card */}
                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center flex-shrink-0">
                                <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-slate-900 mb-1">Exportar CSV</h4>
                                <p className="text-sm text-slate-500 mb-4">Compatível com Excel, Google Sheets e qualquer software de contabilidade. Inclui todas as transações do período.</p>
                                <button
                                    onClick={() => handleExport('csv')}
                                    disabled={!isValid || exporting !== null}
                                    className="w-full px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-sm transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {exporting === 'csv' ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
                                            A gerar…
                                        </span>
                                    ) : '⬇ Descarregar CSV'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* PDF Card */}
                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0">
                                <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-slate-900 mb-1">Exportar PDF</h4>
                                <p className="text-sm text-slate-500 mb-4">Relatório formatado e profissional, ideal para partilhar com o teu contabilista ou guardar para os teus registos.</p>
                                <button
                                    onClick={() => handleExport('pdf')}
                                    disabled={!isValid || exporting !== null}
                                    className="w-full px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold text-sm transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {exporting === 'pdf' ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
                                            A gerar PDF…
                                        </span>
                                    ) : '⬇ Descarregar PDF'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Info */}
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                        <p className="text-xs text-slate-500">
                            <strong>📋 Nota:</strong> O PDF requer a biblioteca <code className="bg-slate-100 px-1 py-0.5 rounded text-xs">reportlab</code> instalada no servidor.
                            Se receberes um erro, executa <code className="bg-slate-100 px-1 py-0.5 rounded text-xs">pip install reportlab</code> no diretório do projeto.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
