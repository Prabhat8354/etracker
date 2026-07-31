import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { FiArrowUpRight, FiPlus, FiTrendingUp } from 'react-icons/fi'
import { useAuthContext } from '../context/AuthContext.jsx'
import { useExpenseContext } from '../context/ExpenseContext.jsx'
import DashboardCard from '../components/DashboardCard.jsx'
import QuickStats from '../components/QuickStats.jsx'
import RecentTransactions from '../components/RecentTransactions.jsx'
import AddTransactionModal from '../components/AddTransactionModal.jsx'
import EmptyState from '../components/EmptyState.jsx'
import { formatDate, generateGreeting } from '../utils/helpers.jsx'

function Dashboard() {
  const { user } = useAuthContext()
  const { summary, filteredTransactions, isLoading, transactions, settings } = useExpenseContext()
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
        acc[item.category] = (acc[item.category] || 0) + item.amount
        return acc
      }, {})

    const sorted = Object.entries(totals).sort(([, a], [, b]) => b - a)
    return sorted[0]?.[0] || 'No expenses yet'
  }, [transactions])

  const recentActivity = useMemo(() => transactions.slice(0, 5), [transactions])
  const monthlyBudget = settings.monthlyBudget ?? 3000
  const budgetProgress = Math.min(100, Math.round((summary.expense / monthlyBudget) * 100))

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
    <div className="space-y-8">
      <section className="grid gap-6 xl:grid-cols-[1.35fr_0.85fr]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="rounded-[2rem] border border-slate-200/80 bg-white/80 p-8 shadow-soft backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950/80"
        >
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-4">
              <p className="text-sm uppercase tracking-[0.35em] text-indigo-600 dark:text-indigo-400">Welcome back</p>
              <h1 className="text-4xl font-semibold text-slate-900 dark:text-slate-100">Welcome, {profileName}</h1>
              <p className="text-base text-slate-500 dark:text-slate-400">{generateGreeting()}, and here's your latest financial overview for {currentDate}.</p>
            </div>
            <div className="inline-flex items-center gap-4 rounded-[2rem] border border-slate-200/80 bg-slate-50 px-5 py-4 shadow-sm dark:border-slate-800/80 dark:bg-slate-900/80">
              {user?.photoURL ? (
                <img src={user.photoURL} alt={profileName} className="h-16 w-16 rounded-full object-cover" />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-2xl font-bold text-white shadow-lg shadow-indigo-500/20">
                  {profileName.charAt(0)}
                </div>
              )}
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-slate-400 dark:text-slate-500">Today</p>
                <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">{currentDate}</p>
              </div>
            </div>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <DashboardCard
              label="Total Balance"
              value={summary.balance}
              percentage="4.3%"
              icon={<FiArrowUpRight className="h-5 w-5" />}
              gradient="from-violet-500 to-indigo-500"
            />
            <DashboardCard
              label="Total Income"
              value={summary.income}
              percentage="12.5%"
              icon={<FiTrendingUp className="h-5 w-5" />}
              gradient="from-emerald-500 to-teal-400"
            />
            <DashboardCard
              label="Total Expense"
              value={summary.expense}
              percentage="-8.6%"
              icon={<FiArrowUpRight className="h-5 w-5" />}
              gradient="from-rose-500 to-pink-500"
            />
            <DashboardCard
              label="Savings"
              value={summary.savings}
              percentage="22%"
              icon={<FiArrowUpRight className="h-5 w-5" />}
              gradient="from-sky-500 to-cyan-400"
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut', delay: 0.1 }}
          className="rounded-[2rem] border border-slate-200/80 bg-white/80 p-8 shadow-soft backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950/80"
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-slate-400 dark:text-slate-500">Performance</p>
              <h3 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">Budget health</h3>
            </div>
            <span className="rounded-3xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700 dark:bg-slate-900 dark:text-slate-100">
              {budgetProgress}% used
            </span>
          </div>
          <div className="mt-8 space-y-5">
            <div className="rounded-[1.75rem] bg-slate-100 p-6 dark:bg-slate-900/80">
              <div className="flex items-center justify-between gap-4 text-sm text-slate-500 dark:text-slate-400">
                <span>Budget</span>
                <span>${monthlyBudget.toLocaleString()}</span>
              </div>
              <div className="mt-4 h-4 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500" style={{ width: `${budgetProgress}%` }} />
              </div>
              <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Your monthly spending target and progress.</p>
            </div>
            <div className="rounded-[1.75rem] bg-slate-100 p-6 dark:bg-slate-900/80">
              <p className="text-sm text-slate-500 dark:text-slate-400">Top spending category</p>
              <p className="mt-3 text-3xl font-semibold text-slate-900 dark:text-slate-100">{topCategory}</p>
              <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Track which category is consuming the most of your budget.</p>
            </div>
          </div>
        </motion.div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_0.55fr]">
        <div className="rounded-[2rem] border border-slate-200/80 bg-white/80 p-8 shadow-soft backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950/80">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Recent transactions</h2>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Your latest spending and income entries.</p>
            </div>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-3xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-500"
            >
              <FiPlus className="h-4 w-4" />
              Quick add
            </button>
          </div>
          <div className="mt-8">
            {filteredTransactions.length ? (
              <RecentTransactions items={filteredTransactions.slice(0, 5)} />
            ) : (
              <EmptyState variant="transactions" />
            )}
          </div>
        </div>

        <QuickStats summary={summary} />
      </section>

      <section className="rounded-[2rem] border border-slate-200/80 bg-white/80 p-8 shadow-soft backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950/80">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Recent activity</h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Your last five entries at a glance.</p>
          </div>
          <span className="rounded-full bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300">Updated {formatDate(new Date().toISOString())}</span>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {recentActivity.length ? (
            recentActivity.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="rounded-[1.75rem] border border-slate-200/80 bg-slate-50 p-5 shadow-sm dark:border-slate-800/80 dark:bg-slate-900/80"
              >
                <p className="text-sm text-slate-500 dark:text-slate-400">{item.category}</p>
                <p className="mt-3 text-lg font-semibold text-slate-900 dark:text-slate-100">{item.title}</p>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{formatDate(item.date)}</p>
                <p className={`mt-4 text-xl font-semibold ${item.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                  {item.type === 'income' ? '+' : '-'}${Number(item.amount).toLocaleString()}
                </p>
              </motion.div>
            ))
          ) : (
            <EmptyState message="No recent activity yet. Add your first transaction." />
          )}
        </div>
      </section>

      <AddTransactionModal open={isModalOpen} onOpenChange={setIsModalOpen} hideTrigger />
    </div>
  )
}

export default Dashboard
