import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, ArrowUpRight, TrendingUp, Sparkles, Calendar, Zap, AlertCircle, Bookmark, DollarSign } from 'lucide-react'
import { useAuthContext } from '../context/AuthContext.jsx'
import { useExpenseContext } from '../context/ExpenseContext.jsx'
import DashboardCard from '../components/DashboardCard.jsx'
import QuickStats from '../components/QuickStats.jsx'
import RecentTransactions from '../components/RecentTransactions.jsx'
import AddTransactionModal from '../components/AddTransactionModal.jsx'
import EmptyState from '../components/EmptyState.jsx'
import { formatDate, formatCurrency } from '../utils/helpers.jsx'

function Dashboard() {
  const { user } = useAuthContext()
  const { summary, filteredTransactions, isLoading, transactions, settings, rates, quote, bills, convertCurrency, savingsGoal } = useExpenseContext()
  const [isModalOpen, setIsModalOpen] = useState(false)

  const profileName = user?.displayName || user?.email?.split('@')[0] || 'User'
  const currentDate = useMemo(
    () => new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }),
    []
  )

  const topCategory = useMemo(() => {
    const totals = transactions
      .filter((item) => item.type === 'expense')
      .reduce((acc, item) => {
        const amt = convertCurrency(item.amount, item.currency || 'USD', settings.currency)
        acc[item.category] = (acc[item.category] || 0) + amt
        return acc
      }, {})

    const sorted = Object.entries(totals).sort(([, a], [, b]) => b - a)
    return sorted[0]?.[0] || 'No expenses yet'
  }, [transactions, settings.currency, rates])

  // Convert USD transactions to display in preferred currency
  const recentActivity = useMemo(() => {
    return transactions.slice(0, 5)
  }, [transactions])

  const monthlyBudget = settings.monthlyBudget ?? 3000
  const budgetProgress = Math.min(100, Math.round((summary.expense / monthlyBudget) * 100))

  // Savings Goal calculations
  const convertedGoal = convertCurrency(savingsGoal.amount, savingsGoal.currency || 'USD', settings.currency)
  const savingsProgress = Math.min(100, Math.round((summary.savings / convertedGoal) * 100)) || 0
  const remainingSavings = Math.max(0, convertedGoal - summary.savings)

  // Circular progress dimensions
  const radius = 30
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (savingsProgress / 100) * circumference

  // Insights messages
  const insights = useMemo(() => {
    let expenseMsg = "Good job! Spending is within target budgets."
    if (budgetProgress > 80) {
      expenseMsg = "Warning: Spending has crossed 80% of monthly targets."
    } else if (budgetProgress > 50) {
      expenseMsg = "Budget warning: Over half of budget target utilized."
    }

    let savingsMsg = "Consider cutting Groceries costs to reach savings targets."
    if (savingsProgress >= 100) {
      savingsMsg = "Excellent! You reached your savings target goal!"
    } else if (savingsProgress > 50) {
      savingsMsg = "Awesome savings speed! You are on track to hit savings goal."
    }

    return { expenseMsg, savingsMsg }
  }, [budgetProgress, savingsProgress])

  const upcomingBills = useMemo(() => {
    const calculateDaysLeft = (dueDateString) => {
      const due = new Date(dueDateString)
      const now = new Date()
      due.setHours(0, 0, 0, 0)
      now.setHours(0, 0, 0, 0)
      const diffTime = due.getTime() - now.getTime()
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    }

    return [...bills]
      .filter((b) => b.status === 'pending')
      .map((b) => {
        const daysLeft = calculateDaysLeft(b.dueDate || b.date)
        return {
          ...b,
          daysLeft
        }
      })
      .sort((a, b) => a.daysLeft - b.daysLeft)
      .slice(0, 3)
  }, [bills])

  useEffect(() => {
    const handleShortcut = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'n') {
        event.preventDefault()
        setIsModalOpen(true)
      }
    }

    window.addEventListener('keydown', handleShortcut)
    return () => window.removeEventListener('keydown', handleShortcut)
  }, [])

  if (isLoading) return <EmptyState loading />

  return (
    <div className="space-y-8 pb-10">
      
      {/* Welcome & Overview Header */}
      <section className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr_0.8fr]">
        
        {/* Welcome & Stats */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="rounded-3xl border border-slate-200/30 bg-white/60 p-8 shadow-soft backdrop-blur-md dark:border-white/[0.02] dark:bg-slate-950/40 relative overflow-hidden"
        >
          {/* Subtle Decorative Blob */}
          <div className="absolute -top-16 -right-16 h-36 w-36 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none" />

          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
                <p className="text-[9px] font-black uppercase tracking-[0.25em] text-indigo-600 dark:text-indigo-400">Workspace</p>
              </div>
              <h1 className="text-2.5xl font-extrabold tracking-tight text-slate-800 dark:text-white leading-tight">
                Welcome back, {profileName}
              </h1>
              <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 max-w-sm italic">
                "{quote}"
              </p>
            </div>
            
            <div className="inline-flex shrink-0 items-center gap-3 rounded-2xl border border-slate-200/30 bg-white/40 p-3 dark:border-white/[0.02] dark:bg-slate-900/20 shadow-sm">
              <div>
                <p className="text-[9px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Timeline</p>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{currentDate}</p>
              </div>
            </div>
          </div>

          {/* Statistics Grid */}
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <DashboardCard
              label="Total Balance"
              value={summary.balance}
              percentage="Ledger"
              icon={<ArrowUpRight className="h-4.5 w-4.5" />}
              gradient="from-indigo-500 to-purple-500"
            />
            <DashboardCard
              label="Total Income"
              value={summary.income}
              percentage={`${summary.incomeChange}%`}
              icon={<TrendingUp className="h-4.5 w-4.5" />}
              gradient="from-emerald-500 to-teal-500"
            />
            <DashboardCard
              label="Total Expense"
              value={summary.expense}
              percentage={`${summary.expenseChange}%`}
              icon={<ArrowUpRight className="h-4.5 w-4.5 rotate-90" />}
              gradient="from-rose-500 to-pink-500"
            />
            <DashboardCard
              label="Savings"
              value={summary.savings}
              percentage="Dynamic"
              icon={<Sparkles className="h-4.5 w-4.5" />}
              gradient="from-amber-500 to-orange-500"
            />
          </div>
        </motion.div>

        {/* Budget Health Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut', delay: 0.1 }}
          className="rounded-3xl border border-slate-200/30 bg-white/60 p-8 shadow-soft backdrop-blur-md dark:border-white/[0.02] dark:bg-slate-950/40 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Performance</p>
                <h3 className="mt-1 text-base font-bold tracking-tight text-slate-800 dark:text-white">Budget limit</h3>
              </div>
              <span className="rounded-lg bg-slate-100/60 dark:bg-slate-900/60 px-2 py-0.5 text-[9px] font-bold text-slate-600 dark:text-slate-300">
                {budgetProgress}% Used
              </span>
            </div>

            <div className="mt-6 space-y-4">
              <div className="rounded-2xl border border-slate-200/30 bg-white/40 p-4.5 dark:border-white/[0.02] dark:bg-slate-900/10">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
                  <span>Monthly budget limit</span>
                  <span className="font-bold text-slate-800 dark:text-white">{formatCurrency(monthlyBudget, settings.currency)}</span>
                </div>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200/20 dark:border-white/[0.02]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-glow transition-all duration-700"
                    style={{ width: `${budgetProgress}%` }}
                  />
                </div>
                <p className="mt-3 text-[10px] font-bold text-indigo-500 dark:text-indigo-400 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {insights.expenseMsg}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/30 bg-white/40 p-4.5 dark:border-white/[0.02] dark:bg-slate-900/10 mt-4">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <Zap className="h-4 w-4 text-amber-500" />
              <span>Top Category</span>
            </div>
            <p className="mt-2 text-lg font-black text-slate-800 dark:text-white truncate">{topCategory}</p>
          </div>
        </motion.div>

        {/* Savings Goal Circular Ring Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut', delay: 0.15 }}
          className="rounded-3xl border border-slate-200/30 bg-white/60 p-8 shadow-soft backdrop-blur-md dark:border-white/[0.02] dark:bg-slate-950/40 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Savings target</p>
              <h3 className="mt-1 text-base font-bold tracking-tight text-slate-800 dark:text-white">Savings Goal</h3>
            </div>
            <span className="rounded-lg bg-indigo-500/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              {savingsProgress}% Met
            </span>
          </div>

          <div className="mt-6 flex items-center justify-around gap-4">
            {/* Animated Circular Progress */}
            <div className="relative flex items-center justify-center">
              <svg className="w-20 h-20 transform -rotate-90">
                <circle
                  cx="40"
                  cy="40"
                  r={radius}
                  className="stroke-slate-100 dark:stroke-slate-900"
                  strokeWidth="5"
                  fill="transparent"
                />
                <motion.circle
                  cx="40"
                  cy="40"
                  r={radius}
                  className="stroke-indigo-500"
                  strokeWidth="5"
                  fill="transparent"
                  strokeDasharray={circumference}
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset }}
                  transition={{ duration: 1.2, ease: 'easeOut' }}
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-xs font-black text-slate-800 dark:text-white">{savingsProgress}%</span>
              </div>
            </div>

            <div className="space-y-3 shrink-0">
              <div>
                <p className="text-[9px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Saved</p>
                <p className="text-sm font-bold text-slate-800 dark:text-white">
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: settings.currency }).format(summary.savings)}
                </p>
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Remaining</p>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-300">
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: settings.currency }).format(remainingSavings)}
                </p>
              </div>
            </div>
          </div>

          <p className="mt-4 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {insights.savingsMsg}
          </p>
        </motion.div>
      </section>

      {/* Transactions & Snapshot Section */}
      <section className="grid gap-6 xl:grid-cols-[1.45fr_0.75fr]">
        
        {/* Recent Transactions List */}
        <div className="rounded-3xl border border-slate-200/30 bg-white/60 p-8 shadow-soft backdrop-blur-md dark:border-white/[0.02] dark:bg-slate-950/40">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-slate-800 dark:text-white">Recent logs</h2>
              <p className="mt-1 text-xs font-semibold text-slate-400 dark:text-slate-500">
                Your latest income and expense entries.
              </p>
            </div>
            
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-md hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 transition duration-150"
            >
              <Plus className="h-4 w-4" />
              Add Transaction
            </button>
          </div>

          <div className="mt-6">
            {filteredTransactions.length ? (
              <RecentTransactions items={filteredTransactions.slice(0, 5)} />
            ) : (
              <EmptyState variant="transactions" />
            )}
          </div>
        </div>

        {/* Snapshot Statistics */}
        <QuickStats summary={summary} />
      </section>

      {/* Recent Activity & Upcoming Bills */}
      <section className="grid gap-6 xl:grid-cols-[1.45fr_0.75fr]">
        
        {/* Activity Timeline */}
        <div className="rounded-3xl border border-slate-200/30 bg-white/60 p-8 shadow-soft backdrop-blur-md dark:border-white/[0.02] dark:bg-slate-950/40">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-slate-800 dark:text-white">Activity Timeline</h2>
              <p className="mt-1 text-xs font-semibold text-slate-400 dark:text-slate-500">
                Visual map of your last five updates.
              </p>
            </div>
            <span className="rounded-lg bg-indigo-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Live updates active
            </span>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {recentActivity.length ? (
              recentActivity.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -4, scale: 1.015 }}
                  transition={{ duration: 0.35, delay: index * 0.05 }}
                  className="rounded-2xl border border-slate-200/30 bg-white/40 p-4.5 dark:border-white/[0.02] dark:bg-slate-950/20 shadow-soft"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 truncate max-w-[80%]">
                      {item.category}
                    </span>
                    <span className={`h-1.5 w-1.5 rounded-full ${item.type === 'income' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                  </div>
                  <h4 className="mt-3.5 text-xs font-bold text-slate-800 dark:text-white truncate">{item.title}</h4>
                  <p className="mt-1 text-[9px] font-bold text-slate-400 dark:text-slate-400">{formatDate(item.date)}</p>
                  <div className="mt-3.5 flex flex-col">
                    <p className={`text-base font-black tracking-tight ${
                      item.type === 'income' ? 'text-emerald-500' : 'text-rose-500'
                    }`}>
                      {item.type === 'income' ? '+' : '-'}{formatCurrency(item.amount, item.currency || 'USD')}
                    </p>
                    {item.currency && item.currency !== settings.currency && (
                      <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">
                        ≈ {formatCurrency(convertCurrency(item.amount, item.currency, settings.currency), settings.currency)}
                      </p>
                    )}
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-6">
                <EmptyState message="No recent activity yet. Add your first transaction." />
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Bills Card */}
        <div className="rounded-3xl border border-slate-200/30 bg-white/60 p-8 shadow-soft backdrop-blur-md dark:border-white/[0.02] dark:bg-slate-950/40 space-y-5 flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-800 dark:text-white">Upcoming Commitments</h2>
            <p className="mt-1 text-xs font-semibold text-slate-400 dark:text-slate-500">
              Manage commitment schedules dynamically.
            </p>
          </div>

          <div className="space-y-3.5">
            {upcomingBills.length ? (
              upcomingBills.map((bill) => {
                let badgeColor = 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20'
                let badgeText = `${bill.daysLeft}d left`
                if (bill.daysLeft < 0) {
                  badgeColor = 'text-rose-500 bg-rose-500/10 border-rose-500/20 animate-pulse'
                  badgeText = 'Overdue'
                } else if (bill.daysLeft === 0) {
                  badgeColor = 'text-amber-500 bg-amber-500/10 border-amber-500/20'
                  badgeText = 'Today'
                } else if (bill.daysLeft <= 7) {
                  badgeColor = 'text-amber-500 bg-amber-500/10 border-amber-500/20'
                  badgeText = `${bill.daysLeft}d left`
                }

                return (
                  <div
                    key={bill.id}
                    className="flex items-center justify-between p-3 rounded-2xl border border-slate-200/20 bg-slate-50/30 dark:border-white/[0.02] dark:bg-slate-900/10"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-sm bg-white dark:bg-slate-950 h-9 w-9 rounded-xl flex items-center justify-center shadow-sm shrink-0">
                        💳
                      </span>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-800 dark:text-white truncate">{bill.name}</h4>
                        <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">Due {bill.dueDate || bill.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`px-2 py-0.5 rounded-lg border text-[8px] font-black uppercase tracking-wider ${badgeColor}`}>
                        {badgeText}
                      </span>
                      <span className="text-xs font-extrabold text-slate-800 dark:text-white">
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: settings.currency }).format(bill.amount)}
                      </span>
                    </div>
                  </div>
                )
              })
            ) : (
              <p className="text-center text-xs font-semibold text-slate-400 dark:text-slate-400 py-4">No pending commitments.</p>
            )}
          </div>
        </div>
      </section>

      {/* Floating Add Expense Button */}
      <motion.button
        whileHover={{ scale: 1.08, y: -2 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex h-13 w-13 items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-xl hover:shadow-glow transition-shadow duration-300 lg:bottom-8 lg:right-8"
        aria-label="Quick Add Transaction"
      >
        <Plus className="h-5.5 w-5.5" />
      </motion.button>

      {/* Add Transaction Modal */}
      <AddTransactionModal open={isModalOpen} onOpenChange={setIsModalOpen} hideTrigger />
    </div>
  )
}

export default Dashboard
