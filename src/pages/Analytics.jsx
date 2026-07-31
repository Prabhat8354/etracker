import { useMemo } from "react";

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
  LineChart,
  Line,
  Legend,
} from "recharts";

import { useExpenseContext } from "../context/ExpenseContext.jsx";
import AnalyticsCard from "../components/AnalyticsCard.jsx";
import EmptyState from "../components/EmptyState.jsx";

const colors = ['#6366f1', '#22c55e', '#fb7185', '#38bdf8', '#f59e0b', '#a855f7', '#f97316']

function Analytics() {
  const { transactions, summary, isLoading } = useExpenseContext()

  const expenseByCategory = useMemo(() => {
    const totals = {}
    transactions.filter((item) => item.type === 'expense').forEach((item) => {
      totals[item.category] = (totals[item.category] || 0) + item.amount
    })
    return Object.entries(totals)
      .map(([category, value]) => ({ category, value }))
      .sort((a, b) => b.value - a.value)
  }, [transactions])

  const monthlyTotals = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const values = months.map((month) => ({ month, expense: 0, income: 0 }))
    transactions.forEach((item) => {
      const date = new Date(item.date)
      const month = months[date.getMonth()]
      const entry = values.find((value) => value.month === month)
      if (item.type === 'expense') entry.expense += item.amount
      else entry.income += item.amount
    })
    return values
  }, [transactions])

  if (isLoading) return <EmptyState loading />

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-slate-200/80 bg-white/80 p-8 shadow-soft backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950/80">
        <p className="text-sm uppercase tracking-[0.35em] text-indigo-600 dark:text-indigo-400">Analytics</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-900 dark:text-slate-100">Visualize spending with intelligent charts</h1>
        <p className="mt-3 max-w-2xl text-slate-500 dark:text-slate-400">Actionable insights help you identify patterns and make smarter decisions.</p>
      </section>

      <div className="grid gap-6 xl:grid-cols-[0.96fr_0.58fr]">
        <div className="grid gap-6">
          <div className="rounded-[2rem] border border-slate-200/80 bg-white/80 p-8 shadow-soft backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950/80">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Expense by category</h2>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">A clear breakdown of where your money is going.</p>
              </div>
            </div>
            <div className="mt-8 h-[340px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={expenseByCategory} dataKey="value" nameKey="category" innerRadius={70} outerRadius={120} paddingAngle={4}>
                    {expenseByCategory.map((entry, index) => (
                      <Cell key={entry.category} fill={colors[index % colors.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {expenseByCategory.map((entry, index) => (
                  <div key={entry.category} className="flex items-center gap-3 rounded-3xl border border-slate-200/80 bg-slate-50 p-4 dark:border-slate-800/80 dark:bg-slate-900/80">
                    <span className={`inline-flex h-3 w-3 rounded-full bg-[${colors[index % colors.length]}]`} style={{ backgroundColor: colors[index % colors.length] }} />
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{entry.category}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">${entry.value.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200/80 bg-white/80 p-8 shadow-soft backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950/80">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Monthly expenses</h2>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Track how spending behaves over time.</p>
              </div>
            </div>
            <div className="mt-8 h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyTotals} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} stroke="#94a3b8" />
                  <YAxis axisLine={false} tickLine={false} stroke="#94a3b8" />
                  <Tooltip contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 24px 80px rgba(15, 23, 42, 0.08)' }} />
                  <Bar dataKey="expense" fill="#f43f5e" radius={[12, 12, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <AnalyticsCard title="Highest expense category" value={expenseByCategory[0]?.category || 'None'} description="Most frequent spend in the last 30 days." />
          <AnalyticsCard title="Monthly spending" value={`$${summary.expense.toLocaleString()}`} description="Total money spent for current period." />
          <AnalyticsCard title="Average expense" value={`$${(summary.expense / Math.max(1, transactions.filter((item) => item.type === 'expense').length)).toFixed(0)}`} description="Average amount per expense." />
          <AnalyticsCard title="Average income" value={`$${(summary.income / Math.max(1, transactions.filter((item) => item.type === 'income').length)).toFixed(0)}`} description="Average amount per income." />
        </div>
      </div>

      <div className="rounded-[2rem] border border-slate-200/80 bg-white/80 p-8 shadow-soft backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950/80">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Income vs Expense</h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Compare your inflow and outflow in one glance.</p>
          </div>
        </div>
        <div className="mt-8 h-[360px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyTotals} margin={{ top: 8, right: 20, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} stroke="#94a3b8" />
              <YAxis axisLine={false} tickLine={false} stroke="#94a3b8" />
              <Tooltip contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 24px 80px rgba(15, 23, 42, 0.08)' }} />
              <Legend verticalAlign="top" height={36} />
              <Line type="monotone" dataKey="income" stroke="#22c55e" strokeWidth={3} dot={false} />
              <Line type="monotone" dataKey="expense" stroke="#f43f5e" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

export default Analytics
