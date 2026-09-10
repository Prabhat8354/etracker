import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Sparkles,
  Target,
  Clock,
  Landmark,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  AlertCircle,
  Calendar,
  Hourglass,
  DollarSign
} from 'lucide-react'
import { useExpenseContext } from '../context/ExpenseContext.jsx'
import AddBillModal from '../components/AddBillModal.jsx'
import DeleteModal from '../components/DeleteModal.jsx'
import { formatCurrency, parseLocalDate } from '../utils/helpers.jsx'
import { DEFAULT_CURRENCY } from '../utils/currency.js'

function Savings() {
  const { transactions, summary, settings, setSettings, rates, bills, deleteBill, toggleBillStatus, convertCurrency, savingsGoal, updateSavingsGoal } = useExpenseContext()
  const [isBillModalOpen, setIsBillModalOpen] = useState(false)
  const [editingBill, setEditingBill] = useState(null)
  const [deletingBill, setDeletingBill] = useState(null)

  // Smart Savings Goal Calculations
  const period = savingsGoal.frequency || 'monthly'
  const currency = settings?.currency || DEFAULT_CURRENCY

  // Filter transactions in the current period to calculate target savings progress
  const currentPeriodTransactions = useMemo(() => {
    const now = new Date()
    return transactions.filter((t) => {
      const tDate = parseLocalDate(t.date)
      if (period === 'daily') {
        return tDate.toDateString() === now.toDateString()
      }
      if (period === 'weekly') {
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        return tDate >= oneWeekAgo && tDate <= now
      }
      if (period === 'yearly') {
        return tDate.getFullYear() === now.getFullYear()
      }
      // monthly (default)
      return tDate.getMonth() === now.getMonth() && tDate.getFullYear() === now.getFullYear()
    })
  }, [transactions, period])

  const periodIncome = useMemo(() => 
    currentPeriodTransactions
      .filter(t => t.type === 'income')
      .reduce((s, t) => s + convertCurrency(t.amount, t.currency || DEFAULT_CURRENCY, currency), 0),
    [currentPeriodTransactions, currency, rates]
  )
  const periodExpense = useMemo(() => 
    currentPeriodTransactions
      .filter(t => t.type === 'expense')
      .reduce((s, t) => s + convertCurrency(t.amount, t.currency || DEFAULT_CURRENCY, currency), 0),
    [currentPeriodTransactions, currency, rates]
  )
  
  // Real-time Savings = Inflow - Outflow in the selected goal period
  const currentSavings = Math.max(0, periodIncome - periodExpense)
  const convertedGoal = convertCurrency(savingsGoal.amount, savingsGoal.currency || DEFAULT_CURRENCY, currency)
  const savingsProgress = Math.min(100, Math.round((currentSavings / convertedGoal) * 100)) || 0
  const remainingSavings = Math.max(0, convertedGoal - currentSavings)

  // Circular ring properties
  const radius = 35
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (savingsProgress / 100) * circumference

  // Dynamic Timeline History reconstruction from all past months
  const savingsGoalsHistory = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const historyMap = {}

    transactions.forEach(t => {
      const date = parseLocalDate(t.date)
      const key = `${months[date.getMonth()]} ${date.getFullYear()}`
      if (!historyMap[key]) {
        historyMap[key] = { income: 0, expense: 0, year: date.getFullYear(), monthIdx: date.getMonth() }
      }
      const fromRate = rates[t.currency || 'USD'] || 1
      const usdAmount = Number(t.amount) / fromRate
      if (t.type === 'income') historyMap[key].income += usdAmount
      else historyMap[key].expense += usdAmount
    })

    const now = new Date()
    const currentKey = `${months[now.getMonth()]} ${now.getFullYear()}`
    const rate = rates[settings.currency] || 1
    const goalVal = convertCurrency(savingsGoal.amount, savingsGoal.currency || DEFAULT_CURRENCY, settings.currency)

    return Object.entries(historyMap)
      .filter(([key]) => key !== currentKey)
      .map(([key, data]) => {
        const savings = Math.max(0, data.income - data.expense) * rate
        return {
          month: key,
          savings,
          goal: goalVal,
          completed: savings >= goalVal,
          year: data.year,
          monthIdx: data.monthIdx
        }
      })
      .sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year
        return b.monthIdx - a.monthIdx
      })
  }, [transactions, rates, settings.currency, savingsGoal])

  // Count Completed/Missed goals
  const goalMetrics = useMemo(() => {
    const completed = savingsGoalsHistory.filter(h => h.completed).length
    const total = savingsGoalsHistory.length
    return {
      completed,
      missed: total - completed,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
    }
  }, [savingsGoalsHistory])

  // Countdown and status highlight calculator for bills
  const calculateDaysLeft = (dueDateString) => {
    const due = new Date(dueDateString)
    const now = new Date()
    due.setHours(0, 0, 0, 0)
    now.setHours(0, 0, 0, 0)
    const diffTime = due.getTime() - now.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  const getBillStatusConfig = (bill) => {
    if (bill.status === 'paid') {
      return { label: 'Paid', bg: 'bg-emerald-500/10 text-emerald-500', border: 'border-emerald-500/25', ring: 'bg-emerald-500' }
    }
    const daysLeft = calculateDaysLeft(bill.dueDate || bill.date)
    if (daysLeft < 0) {
      return { label: `Overdue (${Math.abs(daysLeft)}d)`, bg: 'bg-rose-500/10 text-rose-500', border: 'border-rose-500/25', ring: 'bg-rose-500' }
    }
    if (daysLeft <= 7) {
      return { label: `Due in ${daysLeft}d`, bg: 'bg-amber-500/10 text-amber-500', border: 'border-amber-500/25', ring: 'bg-amber-500' }
    }
    return { label: `In ${daysLeft} days`, bg: 'bg-indigo-500/10 text-indigo-500', border: 'border-indigo-500/25', ring: 'bg-indigo-500' }
  }

  const handleEditBill = (bill) => {
    setEditingBill(bill)
    setIsBillModalOpen(true)
  }

  const handleCreateBill = () => {
    setEditingBill(null)
    setIsBillModalOpen(true)
  }

  return (
    <div className="space-y-8 pb-10">
      
      {/* Title Header Card */}
      <section className="rounded-3xl border border-slate-200/30 bg-white/60 p-8 shadow-soft backdrop-blur-md dark:border-white/[0.02] dark:bg-slate-950/40 relative overflow-hidden">
        <div className="absolute -top-16 -right-16 h-36 w-36 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none" />
        <div className="flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
          <p className="text-[9px] font-black uppercase tracking-[0.25em] text-indigo-600 dark:text-indigo-400">Savings Target</p>
        </div>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white leading-tight">
          Savings & Commitments
        </h1>
        <p className="mt-2 text-xs font-semibold text-slate-400 dark:text-slate-500 max-w-xl leading-relaxed">
          Track smart savings indicators, review completed targets, and manage upcoming recurring bill deadlines.
        </p>
      </section>

      {/* Grid: Savings Progress & Goals editor */}
      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.85fr]">
        
        {/* Savings Goal Circular Card */}
        <div className="rounded-3xl border border-slate-200/30 bg-white/60 p-8 shadow-soft backdrop-blur-md dark:border-white/[0.02] dark:bg-slate-950/40 relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Savings Goal Meter</p>
                <h3 className="mt-1 text-base font-bold text-slate-800 dark:text-white">Current Period Target</h3>
              </div>
              <span className="rounded-lg bg-indigo-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                {savingsProgress}% Met
              </span>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-around gap-6">
              
              {/* SVG circular Ring */}
              <div className="relative flex items-center justify-center">
                <svg className="w-28 h-28 transform -rotate-90">
                  <circle
                    cx="56"
                    cy="56"
                    r={radius}
                    className="stroke-slate-100 dark:stroke-slate-900"
                    strokeWidth="6.5"
                    fill="transparent"
                  />
                  <motion.circle
                    cx="56"
                    cy="56"
                    r={radius}
                    className="stroke-indigo-500"
                    strokeWidth="6.5"
                    fill="transparent"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-base font-black text-slate-800 dark:text-white">{savingsProgress}%</span>
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wide">Target</span>
                </div>
              </div>

              {/* Targets Summary Indicators */}
              <div className="space-y-4 w-full max-w-[200px]">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Period net Savings</p>
                  <p className="text-xl font-extrabold text-slate-800 dark:text-white mt-0.5">{formatCurrency(currentSavings, currency)}</p>
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Remaining to Target</p>
                  <p className="text-xl font-extrabold text-slate-800 dark:text-slate-300 mt-0.5">{formatCurrency(remainingSavings, currency)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Linear Progress bar */}
          <div className="mt-8 border-t border-slate-200/20 pt-6 dark:border-white/[0.02]">
            <div className="flex justify-between text-xs font-semibold text-slate-400 dark:text-slate-500 mb-2">
              <span>Goal limit: {formatCurrency(convertedGoal, currency)}</span>
              <span>{savingsProgress}% Met</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-900">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-700"
                style={{ width: `${savingsProgress}%` }}
              />
            </div>
            <p className="mt-3 text-[10px] font-semibold text-slate-400 dark:text-slate-500">
              *Net savings calculates your total inflows minus outflows specifically within this target duration.
            </p>
          </div>
        </div>
 
        {/* Edit savings settings Card */}
        <div className="rounded-3xl border border-slate-200/30 bg-white/60 p-8 shadow-soft backdrop-blur-md dark:border-white/[0.02] dark:bg-slate-950/40 space-y-6">
          <div>
            <h3 className="text-lg font-bold tracking-tight text-slate-800 dark:text-white">Smart Goal Settings</h3>
            <p className="mt-1 text-xs font-semibold text-slate-400 dark:text-slate-500">
              Configure savings target limits and durations.
            </p>
          </div>
 
          <div className="space-y-4">
            
            {/* Value Editor */}
            <div className="rounded-2xl border border-slate-200/30 bg-white/40 p-4.5 dark:border-white/[0.02] dark:bg-slate-900/10 space-y-2">
              <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                <Target className="h-4 w-4 text-indigo-500" />
                Target Value
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={savingsGoal.amount}
                  onChange={(event) => updateSavingsGoal({ ...savingsGoal, amount: Number(event.target.value) })}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-750 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:focus:border-indigo-400"
                  placeholder="e.g. 500"
                  min="0"
                />
                <select
                  value={savingsGoal.currency || 'USD'}
                  onChange={(event) => updateSavingsGoal({ ...savingsGoal, currency: event.target.value })}
                  className="rounded-xl border border-slate-200 bg-white px-2 py-2.5 text-xs font-semibold text-slate-750 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                >
                  <option value="USD">USD</option>
                  <option value="INR">INR</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="JPY">JPY</option>
                  <option value="CAD">CAD</option>
                  <option value="AUD">AUD</option>
                  <option value="AED">AED</option>
                  <option value="SAR">SAR</option>
                  <option value="SGD">SGD</option>
                </select>
              </div>
            </div>
 
            {/* Duration selector */}
            <div className="rounded-2xl border border-slate-200/30 bg-white/40 p-4.5 dark:border-white/[0.02] dark:bg-slate-900/10 space-y-2">
              <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                <Clock className="h-4 w-4 text-purple-500" />
                Goal Duration Period
              </label>
              <select
                value={savingsGoal.frequency || 'monthly'}
                onChange={(event) => updateSavingsGoal({ ...savingsGoal, frequency: event.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-750 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:focus:border-indigo-400"
              >
                <option value="daily">Daily Target</option>
                <option value="weekly">Weekly Target</option>
                <option value="monthly">Monthly Target</option>
                <option value="yearly">Yearly Target</option>
              </select>
            </div>

          </div>
        </div>

      </div>

      {/* commitments / Bills Workspace */}
      <section className="rounded-3xl border border-slate-200/30 bg-white/60 p-8 shadow-soft backdrop-blur-md dark:border-white/[0.02] dark:bg-slate-950/40">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-800 dark:text-white">Upcoming Commitments</h2>
            <p className="mt-1 text-xs font-semibold text-slate-400 dark:text-slate-500">
              Manage commitments, verify due dates, and update billing schedules.
            </p>
          </div>
          <button
            type="button"
            onClick={handleCreateBill}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-md hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 transition"
          >
            <Plus className="h-4 w-4" />
            Add Commitment
          </button>
        </div>

        {/* commitments List Grid */}
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {bills.length ? (
            bills.map((bill) => {
              const statusConfig = getBillStatusConfig(bill)
              return (
                <div
                  key={bill.id}
                  className="rounded-2xl border border-slate-200/30 bg-white/40 p-5 dark:border-white/[0.02] dark:bg-slate-950/20 shadow-soft flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg border text-[9px] font-black uppercase tracking-wider ${statusConfig.bg} ${statusConfig.border}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${statusConfig.ring}`} />
                        {statusConfig.label}
                      </span>
                      <h4 className="mt-3 text-sm font-extrabold text-slate-800 dark:text-white truncate">{bill.name}</h4>
                      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-1 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Due {bill.dueDate || bill.date} • {bill.frequency || bill.repeat}
                      </p>
                    </div>
                    
                    <p className="text-base font-black text-slate-800 dark:text-white">
                      {formatCurrency(bill.amount, currency)}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-200/20 dark:border-white/[0.02] flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => toggleBillStatus(bill.id)}
                      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition cursor-pointer ${
                        bill.status === 'paid'
                          ? 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800'
                          : 'bg-indigo-500 text-white shadow-sm shadow-indigo-500/10 hover:bg-indigo-600'
                      }`}
                    >
                      <CheckCircle className="h-3.5 w-3.5" />
                      {bill.status === 'paid' ? 'Mark Pending' : 'Mark Paid'}
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleEditBill(bill)}
                        className="inline-flex h-8.5 w-8.5 items-center justify-center rounded-lg border border-slate-200/40 bg-white/80 text-slate-500 hover:text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:text-white cursor-pointer"
                        aria-label="Edit commitment"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingBill(bill)}
                        className="inline-flex h-8.5 w-8.5 items-center justify-center rounded-lg border border-rose-200/40 bg-rose-50/20 text-rose-500 hover:bg-rose-500/10 dark:border-rose-950/20 cursor-pointer"
                        aria-label="Delete commitment"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="col-span-full py-12 px-6 rounded-3xl border border-dashed border-slate-200/60 dark:border-white/[0.05] bg-white/30 dark:bg-slate-950/20 text-center flex flex-col items-center justify-center">
              <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-3">
                <Calendar className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">No upcoming commitments</h3>
              <p className="mt-1 text-xs text-slate-400 dark:text-slate-500 max-w-sm">
                Add your bills and recurring payments to keep track of them.
              </p>
              <button
                type="button"
                onClick={handleCreateBill}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-md hover:bg-indigo-700 transition cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                + ADD COMMITMENT
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Previous Goals History Timeline */}
      <section className="rounded-3xl border border-slate-200/30 bg-white/60 p-8 shadow-soft backdrop-blur-md dark:border-white/[0.02] dark:bg-slate-950/40">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-800 dark:text-white">Savings History timeline</h2>
          <p className="mt-1 text-xs font-semibold text-slate-400 dark:text-slate-500">
            Timeline metrics of previous goals met or missed.
          </p>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200/30 bg-white/40 p-5 dark:border-white/[0.02] dark:bg-slate-950/20 flex items-center gap-4">
            <span className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <CheckCircle className="h-5 w-5" />
            </span>
            <div>
              <p className="text-[9px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Completed Goals</p>
              <p className="text-xl font-black text-slate-800 dark:text-white mt-0.5">{goalMetrics.completed}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/30 bg-white/40 p-5 dark:border-white/[0.02] dark:bg-slate-950/20 flex items-center gap-4">
            <span className="h-10 w-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
              <AlertCircle className="h-5 w-5" />
            </span>
            <div>
              <p className="text-[9px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Missed Goals</p>
              <p className="text-xl font-black text-slate-800 dark:text-white mt-0.5">{goalMetrics.missed}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/30 bg-white/40 p-5 dark:border-white/[0.02] dark:bg-slate-950/20 flex items-center gap-4">
            <span className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
              <Landmark className="h-5 w-5" />
            </span>
            <div>
              <p className="text-[9px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Avg Target Met Rate</p>
              <p className="text-xl font-black text-slate-800 dark:text-white mt-0.5">{goalMetrics.completionRate}%</p>
            </div>
          </div>
        </div>

        {/* Timeline lists */}
        <div className="mt-8 relative border-l border-slate-200/50 pl-6 space-y-6 dark:border-white/[0.04]">
          {savingsGoalsHistory.length ? (
            savingsGoalsHistory.map((item, index) => (
              <div key={index} className="relative">
                {/* Connector Ring */}
                <span className={`absolute -left-[30px] top-1 h-3.5 w-3.5 rounded-full border-2 bg-white dark:bg-slate-950 ${
                  item.completed ? 'border-emerald-500' : 'border-rose-500'
                }`} />
                
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-4.5 rounded-2xl border border-slate-200/20 bg-slate-50/20 dark:border-white/[0.02] dark:bg-slate-900/10 max-w-2xl">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-white">{item.period}</h4>
                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-0.5">
                      Target Goal: {formatCurrency(item.goal, currency)}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 text-right">Saved</p>
                      <p className={`text-sm font-black ${item.completed ? 'text-emerald-500' : 'text-slate-800 dark:text-white'}`}>
                        {formatCurrency(item.savings, currency)}
                      </p>
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg ${
                      item.completed ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                    }`}>
                      {item.completed ? 'Goal Met' : 'Missed'}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 ml-2">Timeline history will populate as months close.</p>
          )}
        </div>
      </section>

      {/* commitments editor Modal */}
      <AddBillModal
        open={isBillModalOpen}
        onOpenChange={setIsBillModalOpen}
        initialBill={editingBill}
      />

      {/* Delete Commitment Confirmation Modal */}
      {deletingBill && (
        <DeleteModal
          title="Delete Commitment"
          message={`Are you sure you want to delete "${deletingBill.name}"? This commitment will be removed from your schedule and Firestore.`}
          onConfirm={async () => {
            await deleteBill(deletingBill.id)
            setDeletingBill(null)
          }}
          onCancel={() => setDeletingBill(null)}
        />
      )}
    </div>
  )
}

export default Savings
