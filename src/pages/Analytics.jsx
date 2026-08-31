import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area,
  Legend,
} from "recharts";

import { useExpenseContext } from "../context/ExpenseContext.jsx";
import AnalyticsCard from "../components/AnalyticsCard.jsx";
import AIInsights from "../components/AIInsights.jsx";
import EmptyState from "../components/EmptyState.jsx";
import { Sparkles, Landmark, Calendar, Award, Zap } from "lucide-react";
import { parseLocalDate } from "../utils/helpers.jsx";

const colors = ['#6366f1', '#10b981', '#f43f5e', '#0ea5e9', '#f59e0b', '#8b5cf6', '#f97316']

const CustomTooltip = ({ active, payload, label, currency = 'USD' }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-slate-200/30 bg-white/90 p-3.5 shadow-xl backdrop-blur-md dark:border-white/[0.04] dark:bg-slate-950/90 text-left">
        <p className="text-[9px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">{label}</p>
        <div className="space-y-1">
          {payload.map((entry, idx) => (
            <div key={idx} className="flex items-center gap-5 justify-between">
              <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400">
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: entry.stroke || entry.fill }} />
                {entry.name}
              </span>
              <span className="text-xs font-extrabold text-slate-800 dark:text-white">
                {new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(entry.value)}
              </span>
            </div>
          ))}
        </div>
      </div>
    )
  }
  return null
}

function Analytics() {
  const { transactions, summary, isLoading, settings, rates, convertCurrency, savingsGoal } = useExpenseContext()
  const currency = settings?.currency || 'USD'

  const expenseByCategory = useMemo(() => {
    const totals = {}
    transactions.filter((item) => item.type === 'expense').forEach((item) => {
      const amt = convertCurrency(item.amount, item.currency || 'USD', settings.currency)
      totals[item.category] = (totals[item.category] || 0) + amt
    })
    return Object.entries(totals)
      .map(([category, value]) => ({ category, value }))
      .sort((a, b) => b.value - a.value)
  }, [transactions, settings.currency, rates])

  const monthlyTotals = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const values = months.map((month) => ({ month, expense: 0, income: 0 }))
    transactions.forEach((item) => {
      const date = parseLocalDate(item.date)
      const month = months[date.getMonth()]
      const entry = values.find((value) => value.month === month)
      if (entry) {
        const amt = convertCurrency(item.amount, item.currency || 'USD', settings.currency)
        if (item.type === 'expense') entry.expense += amt
        else entry.income += amt
      }
    })
    return values
  }, [transactions, settings.currency, rates])

  // Savings Goal & Analytics calculations
  const savingsAnalytics = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const monthlyNet = {}
    
    months.forEach(m => {
      monthlyNet[m] = 0
    })

    transactions.forEach(t => {
      const month = months[parseLocalDate(t.date).getMonth()]
      const amt = convertCurrency(t.amount, t.currency || 'USD', settings.currency)
      if (t.type === 'income') {
        monthlyNet[month] += amt
      } else {
        monthlyNet[month] -= amt
      }
    })

    const monthlyNetConverted = Object.entries(monthlyNet).map(([month, val]) => ({
      month,
      savings: Math.max(0, val)
    }))

    const highest = [...monthlyNetConverted].sort((a, b) => b.savings - a.savings)[0]
    const activeMonths = transactions.length > 0 ? new Set(transactions.map(t => parseLocalDate(t.date).getMonth())).size : 1
    
    const totalSavings = summary.savings
    const avgSavings = totalSavings / activeMonths
    const weeklySavings = avgSavings / 4
    
    const goal = convertCurrency(savingsGoal.amount, savingsGoal.currency || 'USD', settings.currency)
    const goalCompletionRate = Math.min(100, Math.round((totalSavings / goal) * 100))

    return {
      monthlyNetConverted,
      highestMonth: highest && highest.savings > 0 ? `${highest.month} (${new Intl.NumberFormat('en-US', { style: 'currency', currency: settings.currency, maximumFractionDigits: 0 }).format(highest.savings)})` : 'None',
      avgSavings,
      weeklySavings,
      goalCompletionRate
    }
  }, [transactions, rates, settings.currency, summary.savings, savingsGoal])

  if (isLoading) return <EmptyState loading />

  const gridColor = 'rgba(148, 163, 184, 0.05)'

  return (
    <div className="space-y-8 pb-10">
      {/* Title Header Card */}
      <section className="rounded-3xl border border-slate-200/30 bg-white/60 p-8 shadow-soft backdrop-blur-md dark:border-white/[0.02] dark:bg-slate-950/40 relative overflow-hidden">
        <div className="absolute -top-16 -right-16 h-36 w-36 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none" />
        <div className="flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
          <p className="text-[9px] font-black uppercase tracking-[0.25em] text-indigo-600 dark:text-indigo-400">Financial Insights</p>
        </div>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white leading-tight">
          Intelligent Analytics
        </h1>
        <p className="mt-2 text-xs font-semibold text-slate-400 dark:text-slate-500 max-w-2xl leading-relaxed">
          Actionable metrics and customized charts help you monitor allocations and optimize growth strategy.
        </p>
      </section>

      {/* Main Charts & Cards Grid */}
      <div className="grid gap-6 xl:grid-cols-[1.45fr_0.75fr]">
        <div className="grid gap-6">
          
          {/* Pie Chart: Expense Breakdown */}
          <div className="rounded-3xl border border-slate-200/30 bg-white/60 p-8 shadow-soft backdrop-blur-md dark:border-white/[0.02] dark:bg-slate-950/40">
            <div>
              <h2 className="text-lg font-bold tracking-tight text-slate-800 dark:text-white">Expenses by Category</h2>
              <p className="mt-1 text-xs font-semibold text-slate-400 dark:text-slate-500">
                Detailed breakdown of your category distribution.
              </p>
            </div>
            
            {expenseByCategory.length ? (
              <div className="mt-8 flex flex-col md:flex-row md:items-center md:justify-around gap-6">
                <div className="h-[260px] w-full md:w-[260px] shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={expenseByCategory}
                        dataKey="value"
                        nameKey="category"
                        innerRadius={65}
                        outerRadius={95}
                        paddingAngle={4}
                      >
                        {expenseByCategory.map((entry, index) => (
                          <Cell key={entry.category} fill={colors[index % colors.length]} stroke="transparent" />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip currency={currency} />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="flex-1 grid gap-3 sm:grid-cols-2 max-w-lg">
                  {expenseByCategory.map((entry, index) => (
                    <div
                      key={entry.category}
                      className="flex items-center gap-3 rounded-2xl border border-slate-200/30 bg-white/40 p-4 dark:border-white/[0.02] dark:bg-slate-950/20 shadow-soft"
                    >
                      <span className="inline-flex h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: colors[index % colors.length] }} />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 dark:text-white truncate">{entry.category}</p>
                        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-0.5">
                          {new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(entry.value)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mt-8">
                <EmptyState variant="analytics" message="No expense data recorded. Add a transaction with type 'expense'." />
              </div>
            )}
          </div>

          {/* Bar Chart: Monthly Expenses */}
          <div className="rounded-3xl border border-slate-200/30 bg-white/60 p-8 shadow-soft backdrop-blur-md dark:border-white/[0.02] dark:bg-slate-950/40">
            <div>
              <h2 className="text-lg font-bold tracking-tight text-slate-800 dark:text-white">Monthly Expenses</h2>
              <p className="mt-1 text-xs font-semibold text-slate-400 dark:text-slate-500">
                Track and compare monthly spending flows.
              </p>
            </div>
            <div className="mt-8 h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyTotals} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
                  <defs>
                    <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f43f5e" stopOpacity={1}/>
                      <stop offset="100%" stopColor="#f43f5e" stopOpacity={0.25}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} stroke="#94a3b8" className="text-[10px] font-bold" />
                  <YAxis axisLine={false} tickLine={false} stroke="#94a3b8" className="text-[10px] font-bold" />
                  <Tooltip content={<CustomTooltip currency={currency} />} cursor={{ fill: 'rgba(99, 102, 241, 0.02)' }} />
                  <Bar dataKey="expense" fill="url(#barGrad)" radius={[6, 6, 0, 0]} name="Expense" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Analytics Snapshot Cards */}
        <div className="space-y-6">
          <AnalyticsCard
            title="Highest Expense Category"
            value={expenseByCategory[0]?.category || 'None'}
            description="Top consuming segment of your budget."
          />
          <AnalyticsCard
            title="Monthly Spending"
            value={new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(summary.expense)}
            description="Total funds spent in the current workspace."
          />
          <AnalyticsCard
            title="Average Expense"
            value={new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(
              summary.expense / Math.max(1, transactions.filter((item) => item.type === 'expense').length)
            )}
            description="Average value of single expense log."
          />
          <AnalyticsCard
            title="Average Income"
            value={new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(
              summary.income / Math.max(1, transactions.filter((item) => item.type === 'income').length)
            )}
            description="Average value of single income log."
          />
        </div>
      </div>

      {/* Savings Analytics Section */}
      <section className="rounded-3xl border border-slate-200/30 bg-white/60 p-8 shadow-soft backdrop-blur-md dark:border-white/[0.02] dark:bg-slate-950/40 space-y-6">
        <div>
          <div className="flex items-center gap-1.5">
            <Landmark className="h-4 w-4 text-indigo-500" />
            <h2 className="text-xl font-bold tracking-tight text-slate-800 dark:text-white">Savings Analytics</h2>
          </div>
          <p className="mt-1 text-xs font-semibold text-slate-400 dark:text-slate-500">
            Monitor savings performance, averages, and targets completions.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          
          {/* Average Savings Card */}
          <motion.div
            whileHover={{ y: -4, scale: 1.015 }}
            className="rounded-2xl border border-slate-200/30 bg-white/40 p-5 dark:border-white/[0.02] dark:bg-slate-950/20 shadow-soft"
          >
            <div className="flex items-center gap-2">
              <span className="h-8 w-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                <Landmark className="h-4.5 w-4.5" />
              </span>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Average Savings</p>
            </div>
            <p className="mt-3.5 text-2xl font-extrabold text-slate-800 dark:text-white">
              {new Intl.NumberFormat('en-US', { style: 'currency', currency: settings.currency }).format(savingsAnalytics.avgSavings)}
            </p>
            <p className="mt-1 text-[10px] font-bold text-slate-400 dark:text-slate-500">Calculated per active month.</p>
          </motion.div>

          {/* Weekly Savings Card */}
          <motion.div
            whileHover={{ y: -4, scale: 1.015 }}
            className="rounded-2xl border border-slate-200/30 bg-white/40 p-5 dark:border-white/[0.02] dark:bg-slate-950/20 shadow-soft"
          >
            <div className="flex items-center gap-2">
              <span className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <Calendar className="h-4.5 w-4.5" />
              </span>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Weekly Savings</p>
            </div>
            <p className="mt-3.5 text-2xl font-extrabold text-slate-800 dark:text-white">
              {new Intl.NumberFormat('en-US', { style: 'currency', currency: settings.currency }).format(savingsAnalytics.weeklySavings)}
            </p>
            <p className="mt-1 text-[10px] font-bold text-slate-400 dark:text-slate-500">Average weekly savings flow.</p>
          </motion.div>

          {/* Highest Month Card */}
          <motion.div
            whileHover={{ y: -4, scale: 1.015 }}
            className="rounded-2xl border border-slate-200/30 bg-white/40 p-5 dark:border-white/[0.02] dark:bg-slate-950/20 shadow-soft"
          >
            <div className="flex items-center gap-2">
              <span className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
                <Award className="h-4.5 w-4.5" />
              </span>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Highest Month</p>
            </div>
            <p className="mt-3.5 text-lg font-black text-slate-800 dark:text-white truncate">
              {savingsAnalytics.highestMonth}
            </p>
            <p className="mt-2 text-[10px] font-bold text-slate-400 dark:text-slate-500">Record savings period.</p>
          </motion.div>

          {/* Goal Completion Card */}
          <motion.div
            whileHover={{ y: -4, scale: 1.015 }}
            className="rounded-2xl border border-slate-200/30 bg-white/40 p-5 dark:border-white/[0.02] dark:bg-slate-950/20 shadow-soft"
          >
            <div className="flex items-center gap-2">
              <span className="h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500">
                <Award className="h-4.5 w-4.5" />
              </span>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Goal Met Rate</p>
            </div>
            <p className="mt-3.5 text-2xl font-extrabold text-slate-800 dark:text-white">
              {savingsAnalytics.goalCompletionRate}%
            </p>
            <div className="mt-2 h-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-900">
              <div
                className="h-full rounded-full bg-indigo-500 transition-all duration-500"
                style={{ width: `${savingsAnalytics.goalCompletionRate}%` }}
              />
            </div>
          </motion.div>

        </div>
      </section>

      {/* AI Financial Insights Section */}
      <AIInsights />

      {/* Area Chart: Income vs Expense comparison */}
      <div className="rounded-3xl border border-slate-200/30 bg-white/60 p-8 shadow-soft backdrop-blur-md dark:border-white/[0.02] dark:bg-slate-950/40">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-slate-800 dark:text-white">Income vs Expense Curve</h2>
          <p className="mt-1 text-xs font-semibold text-slate-400 dark:text-slate-500">
            Compare inflow and outflow curves over time.
          </p>
        </div>
        <div className="mt-8 h-[340px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyTotals} margin={{ top: 8, right: 12, left: -24, bottom: 0 }}>
              <defs>
                <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} stroke="#94a3b8" className="text-[10px] font-bold" />
              <YAxis axisLine={false} tickLine={false} stroke="#94a3b8" className="text-[10px] font-bold" />
              <Tooltip content={<CustomTooltip currency={currency} />} />
              <Legend verticalAlign="top" height={36} iconType="circle" className="text-xs font-bold" />
              <Area type="monotone" dataKey="income" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#incomeGrad)" name="Income" />
              <Area type="monotone" dataKey="expense" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#expenseGrad)" name="Expense" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

export default Analytics
