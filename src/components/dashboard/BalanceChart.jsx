import { useState, useEffect, useRef } from 'react'
import { apiFetch } from '../../config/api'
import { motion } from 'framer-motion'

// Polyfill para roundRect em browsers antigos
function roundRect(ctx, x, y, w, h, r) {
  if (w < 0) { x += w; w = -w }
  if (h < 0) { y += h; h = -h }
  r = Math.min(r, Math.min(w / 2, h / 2))
  if (r <= 0) { ctx.rect(x, y, w, h); return }
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

export default function BalanceChart({ userData }) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState(6)
  const canvasRef = useRef(null)
  const containerRef = useRef(null)

  useEffect(() => {
    fetchTransactionHistory()
  }, [userData, period])

  const fetchTransactionHistory = async () => {
    if (!userData?.user_id) { setLoading(false); return }
    setLoading(true)
    try {
      // Buscar todas as transações sem filtro de data (o endpoint pode não suportar)
      const resp = await apiFetch('/api/transactions?limit=500')
      if (resp.ok) {
        const json = await resp.json()
        const transactions = json.transactions || []
        const chartData = buildMonthlyData(transactions, period)
        setData(chartData)
      }
    } catch (e) {
      console.error('BalanceChart error:', e)
    } finally {
      setLoading(false)
    }
  }

  const buildMonthlyData = (transactions, months) => {
    const result = []
    const now = new Date()

    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const year = d.getFullYear()
      const month = d.getMonth()
      // Formato mais curto para labels
      const label = d.toLocaleDateString('pt-PT', { month: 'short' }).replace('.', '') + '/' + String(d.getFullYear()).slice(2)

      const monthTxns = transactions.filter(t => {
        const td = new Date(t.date)
        return td.getFullYear() === year && td.getMonth() === month
      })

      const income = monthTxns.filter(t => t.type === 'income').reduce((s, t) => s + parseFloat(t.amount || 0), 0)
      const expense = monthTxns.filter(t => t.type === 'expense').reduce((s, t) => s + parseFloat(t.amount || 0), 0)

      result.push({ label, income, expense, balance: income - expense })
    }
    return result
  }

  useEffect(() => {
    if (data.length === 0) return
    // Pequeno delay para garantir que o container tem dimensões
    const timer = setTimeout(() => drawChart(), 50)
    return () => clearTimeout(timer)
  }, [data])

  const drawChart = () => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1

    // Dimensões reais baseadas no container
    const cssW = container.clientWidth
    const cssH = 260

    // Ajustar canvas para DPI
    canvas.width = cssW * dpr
    canvas.height = cssH * dpr
    canvas.style.width = cssW + 'px'
    canvas.style.height = cssH + 'px'
    ctx.scale(dpr, dpr)

    const W = cssW
    const H = cssH
    ctx.clearRect(0, 0, W, H)

    const pad = { top: 20, right: 16, bottom: 36, left: 60 }
    const chartW = W - pad.left - pad.right
    const chartH = H - pad.top - pad.bottom

    const allValues = data.flatMap(d => [d.income, d.expense])
    const maxVal = Math.max(...allValues, 1)

    const n = data.length
    const groupW = chartW / n
    const bw = Math.min(groupW * 0.3, 30)
    const gap = bw * 0.2

    // Grid horizontal
    ctx.strokeStyle = '#f1f5f9'
    ctx.lineWidth = 1
    for (let i = 0; i <= 4; i++) {
      const y = pad.top + (chartH / 4) * i
      ctx.beginPath()
      ctx.moveTo(pad.left, y)
      ctx.lineTo(pad.left + chartW, y)
      ctx.stroke()

      const val = maxVal * (1 - i / 4)
      ctx.fillStyle = '#94a3b8'
      ctx.font = `${Math.max(10, Math.min(11, cssW / 80))}px Inter, system-ui, sans-serif`
      ctx.textAlign = 'right'
      const label = val >= 1000 ? `€${(val / 1000).toFixed(1)}k` : `€${Math.round(val)}`
      ctx.fillText(label, pad.left - 6, y + 4)
    }

    // Barras
    data.forEach((d, i) => {
      const cx = pad.left + i * groupW + groupW / 2
      const incomeX = cx - bw - gap / 2
      const expenseX = cx + gap / 2

      // Income
      if (d.income > 0) {
        const h = (d.income / maxVal) * chartH
        const y = pad.top + chartH - h
        const grad = ctx.createLinearGradient(0, y, 0, y + h)
        grad.addColorStop(0, '#10b981')
        grad.addColorStop(1, '#6ee7b7')
        ctx.fillStyle = grad
        ctx.beginPath()
        roundRect(ctx, incomeX, y, bw, h, 4)
        ctx.fill()
      }

      // Expense
      if (d.expense > 0) {
        const h = (d.expense / maxVal) * chartH
        const y = pad.top + chartH - h
        const grad = ctx.createLinearGradient(0, y, 0, y + h)
        grad.addColorStop(0, '#ef4444')
        grad.addColorStop(1, '#fca5a5')
        ctx.fillStyle = grad
        ctx.beginPath()
        roundRect(ctx, expenseX, y, bw, h, 4)
        ctx.fill()
      }

      // Label X
      ctx.fillStyle = '#64748b'
      ctx.font = `${Math.max(9, Math.min(11, cssW / 80))}px Inter, system-ui, sans-serif`
      ctx.textAlign = 'center'
      ctx.fillText(d.label, cx, H - 8)
    })
  }

  const formatCurrency = (v) => new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(v || 0)

  const totalIncome = data.reduce((s, d) => s + d.income, 0)
  const totalExpense = data.reduce((s, d) => s + d.expense, 0)
  const netBalance = totalIncome - totalExpense
  const bestMonth = data.filter(d => d.income > 0 || d.expense > 0).reduce((best, d) => d.balance > (best?.balance ?? -Infinity) ? d : best, null)

  return (
    <div className="space-y-4">
      {/* Totais */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <p className="text-xs text-slate-500 mb-1">Receitas</p>
          <p className="text-xl font-black text-emerald-600">{formatCurrency(totalIncome)}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <p className="text-xs text-slate-500 mb-1">Despesas</p>
          <p className="text-xl font-black text-red-500">{formatCurrency(totalExpense)}</p>
        </div>
        <div className={`rounded-xl p-4 border shadow-sm ${netBalance >= 0 ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
          <p className="text-xs text-slate-500 mb-1">Saldo Líquido</p>
          <p className={`text-xl font-black ${netBalance >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>{formatCurrency(netBalance)}</p>
        </div>
      </div>

      {/* Gráfico */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-slate-900">Receitas vs Despesas por Mês</h3>
            {bestMonth && (
              <p className="text-xs text-slate-500 mt-0.5">
                Melhor mês: <span className="font-semibold text-emerald-600">{bestMonth.label}</span> (+{formatCurrency(bestMonth.balance)})
              </p>
            )}
          </div>
          <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
            {[3, 6, 12].map(m => (
              <button key={m} onClick={() => setPeriod(m)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${period === m ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                {m}M
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-4 mb-4">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-emerald-500" />
            <span className="text-xs text-slate-500">Receitas</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-red-500" />
            <span className="text-xs text-slate-500">Despesas</span>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : data.every(d => d.income === 0 && d.expense === 0) ? (
          <div className="flex items-center justify-center h-48 text-slate-400">
            <p className="text-sm">Sem transações no período selecionado</p>
          </div>
        ) : (
          <div ref={containerRef} className="w-full">
            <canvas ref={canvasRef} className="w-full block" />
          </div>
        )}
      </div>

      {/* Tabela por mês */}
      {data.some(d => d.income > 0 || d.expense > 0) && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-bold text-slate-900 text-sm">Detalhe por Mês</h3>
          </div>
          <div className="divide-y divide-gray-50">
            {[...data].reverse().map((d, i) => (
              <motion.div key={i}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                className="flex items-center justify-between px-5 py-3 hover:bg-slate-50 transition-colors">
                <span className="text-sm font-semibold text-slate-700 capitalize w-16">{d.label}</span>
                <div className="flex items-center gap-4 sm:gap-6 text-sm">
                  <span className="text-emerald-600 font-medium">+{formatCurrency(d.income)}</span>
                  <span className="text-red-500 font-medium">-{formatCurrency(d.expense)}</span>
                  <span className={`font-black w-20 text-right ${d.balance >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                    {d.balance >= 0 ? '+' : ''}{formatCurrency(d.balance)}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
