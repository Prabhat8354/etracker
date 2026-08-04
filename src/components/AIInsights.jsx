import { useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Brain,
  TrendingUp,
  TrendingDown,
  Target,
  Flame,
  LineChart,
  Coins,
  Sparkles,
  HelpCircle,
  Lightbulb
} from 'lucide-react'
import { useExpenseContext } from '../context/ExpenseContext.jsx'
import { formatCurrency } from '../utils/helpers.jsx'

function AIInsights() {
  const { transactions, summary, settings, rates } = useExpenseContext()
  const currency = settings?.currency || 'USD'
  const rate = rates[currency] || 1

  // 1. Highest spending category
  const topCategory = useMemo(() => {
    const totals = {}
    transactions
      .filter((item) => item.type === 'expense')
      .forEach((item) => {
        totals[item.category] = (totals[item.category] || 0) + item.amount
      })
    const sorted = Object.entries(totals).sort(([, a], [, b]) => b - a)
    return sorted[0]?.[0] || 'None'
  }, [transactions])

  // 2. Goal proximity details
  const goalProximity = useMemo(() => {
    const goal = settings.savingsGoal || 500
    const completionRate = Math.min(100, Math.round((summary.savings / goal) * 100)) || 0
    if (completionRate >= 100) {
      return { msg: 'Target savings goal achieved!', rate: completionRate, action: 'Outstanding savings performance.' }
    }
    if (completionRate >= 80) {
      return { msg: 'Almost reached your monthly goal.', rate: completionRate, action: 'Save a bit more to cross the target.' }
    }
    return { msg: `Goal progress is at ${completionRate}%`, rate: completionRate, action: 'Keep checking ledger updates.' }
  }, [summary.savings, settings.savingsGoal])

  // 3. Dining out optimization suggestion
  const diningOptimization = useMemo(() => {
    const totalFoodUSD = transactions
      .filter((t) => t.type === 'expense' && t.category.toLowerCase() === 'food')
      .reduce((sum, t) => sum + t.amount, 0)
    
    const totalFoodConverted = totalFoodUSD * rate
    const potentialSavings = totalFoodConverted * 0.15 // 15% reduction suggestion
    return {
      total: totalFoodConverted,
      savings: potentialSavings
    }
  }, [transactions, rate])

  // 4. Monthly Savings Streak
  const savingsStreak = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const monthlyNet = {}
    
    transactions.forEach(t => {
      const date = new Date(t.date)
      const key = `${date.getFullYear()}-${date.getMonth()}`
      if (!monthlyNet[key]) monthlyNet[key] = 0
      if (t.type === 'income') {
        monthlyNet[key] += t.amount
      } else {
        monthlyNet[key] -= t.amount
      }
    })

    const sortedKeys = Object.keys(monthlyNet).sort((a, b) => b.localeCompare(a))
    let streakCount = 0
    for (const key of sortedKeys) {
      if (monthlyNet[key] > 0) {
        streakCount++
      } else {
        break
      }
    }
    return streakCount || 1
  }, [transactions])

  // 5. Predicted Month-End Balance forecast
  const predictedBalance = useMemo(() => {
    const now = new Date()
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
    const currentDay = now.getDate()
    
    const dailySpendUSD = (summary.expense / rate) / Math.max(1, currentDay)
    const estimatedExpenseUSD = dailySpendUSD * daysInMonth
    const currentIncomeUSD = summary.income / rate
    
    const predictedUSD = currentIncomeUSD - estimatedExpenseUSD
    return predictedUSD * rate
  }, [summary.income, summary.expense, rate])

  // 6. Trend summary
  const spendingTrend = useMemo(() => {
    const change = summary.expenseChange || 0
    if (change > 0) {
      return { label: `Spent ${change}% more`, details: 'Expenses are trending higher than last month.', positive: false }
    }
    if (change < 0) {
      return { label: `Spent ${Math.abs(change)}% less`, details: 'Great! Outflows are lower than previous periods.', positive: true }
    }
    return { label: 'Spending matched', details: 'Outflows match last month\'s benchmarks.', positive: true }
  }, [summary.expenseChange])

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-1.5">
        <Brain className="h-5 w-5 text-indigo-500" />
        <h2 className="text-xl font-bold tracking-tight text-slate-800 dark:text-white">AI Financial Insights</h2>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        
        {/* Card 1: Spending Trend */}
        <motion.div
          whileHover={{ y: -4, scale: 1.015 }}
          className="rounded-2xl border border-slate-200/30 bg-white/40 p-5 dark:border-white/[0.02] dark:bg-slate-950/20 shadow-soft flex flex-col justify-between"
        >
          <div className="flex items-center gap-3">
            <span className={`h-8 w-8 rounded-lg flex items-center justify-center ${spendingTrend.positive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
              {spendingTrend.positive ? <TrendingDown className="h-4.5 w-4.5" /> : <TrendingUp className="h-4.5 w-4.5" />}
            </span>
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-550">Spending Trend</p>
              <h4 className="text-sm font-bold text-slate-800 dark:text-white mt-0.5">{spendingTrend.label}</h4>
            </div>
          </div>
          <p className="mt-4 text-[11px] font-semibold text-slate-450 dark:text-slate-500">{spendingTrend.details}</p>
        </motion.div>

        {/* Card 2: Highest Spending Category */}
        <motion.div
          whileHover={{ y: -4, scale: 1.015 }}
          className="rounded-2xl border border-slate-200/30 bg-white/40 p-5 dark:border-white/[0.02] dark:bg-slate-950/20 shadow-soft flex flex-col justify-between"
        >
          <div className="flex items-center gap-3">
            <span className="h-8 w-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
              <Lightbulb className="h-4.5 w-4.5" />
            </span>
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-550">Category Alert</p>
              <h4 className="text-sm font-bold text-slate-800 dark:text-white mt-0.5">Highest Outflow: {topCategory}</h4>
            </div>
          </div>
          <p className="mt-4 text-[11px] font-semibold text-slate-455 dark:text-slate-500">
            {topCategory !== 'None' 
              ? `Spending in ${topCategory} represents the largest portion of current expenses.`
              : 'Add expense logs to review largest category distributions.'}
          </p>
        </motion.div>

        {/* Card 3: Food Savings Suggestion */}
        <motion.div
          whileHover={{ y: -4, scale: 1.015 }}
          className="rounded-2xl border border-slate-200/30 bg-white/40 p-5 dark:border-white/[0.02] dark:bg-slate-950/20 shadow-soft flex flex-col justify-between"
        >
          <div className="flex items-center gap-3">
            <span className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <Coins className="h-4.5 w-4.5" />
            </span>
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-550">Dining Optimizations</p>
              <h4 className="text-sm font-bold text-slate-800 dark:text-white mt-0.5">Save {formatCurrency(diningOptimization.savings, currency)}</h4>
            </div>
          </div>
          <p className="mt-4 text-[11px] font-semibold text-slate-450 dark:text-slate-500">
            {diningOptimization.total > 0
              ? `You can save ${formatCurrency(diningOptimization.savings, currency)} next month by reducing dining expenses by 15%.`
              : 'Record dining/groceries logs in the category "Food" to calculate savings suggestions.'}
          </p>
        </motion.div>

        {/* Card 4: Savings Goal Proximity */}
        <motion.div
          whileHover={{ y: -4, scale: 1.015 }}
          className="rounded-2xl border border-slate-200/30 bg-white/40 p-5 dark:border-white/[0.02] dark:bg-slate-950/20 shadow-soft flex flex-col justify-between"
        >
          <div className="flex items-center gap-3">
            <span className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Target className="h-4.5 w-4.5" />
            </span>
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-555">Goal Proximity</p>
              <h4 className="text-sm font-bold text-slate-800 dark:text-white mt-0.5">{goalProximity.msg}</h4>
            </div>
          </div>
          <p className="mt-4 text-[11px] font-semibold text-slate-450 dark:text-slate-500">{goalProximity.action}</p>
        </motion.div>

        {/* Card 5: Savings Streak */}
        <motion.div
          whileHover={{ y: -4, scale: 1.015 }}
          className="rounded-2xl border border-slate-200/30 bg-white/40 p-5 dark:border-white/[0.02] dark:bg-slate-950/20 shadow-soft flex flex-col justify-between"
        >
          <div className="flex items-center gap-3">
            <span className="h-8 w-8 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center animate-pulse">
              <Flame className="h-4.5 w-4.5" />
            </span>
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-550">Savings Streak</p>
              <h4 className="text-sm font-bold text-slate-800 dark:text-white mt-0.5">{savingsStreak} Month Streak</h4>
            </div>
          </div>
          <p className="mt-4 text-[11px] font-semibold text-slate-450 dark:text-slate-500">You maintained positive net savings for {savingsStreak} consecutive month(s).</p>
        </motion.div>

        {/* Card 6: Month-End Forecast */}
        <motion.div
          whileHover={{ y: -4, scale: 1.015 }}
          className="rounded-2xl border border-slate-200/30 bg-white/40 p-5 dark:border-white/[0.02] dark:bg-slate-950/20 shadow-soft flex flex-col justify-between"
        >
          <div className="flex items-center gap-3">
            <span className="h-8 w-8 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center">
              <LineChart className="h-4.5 w-4.5" />
            </span>
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-555">Predictive Balance</p>
              <h4 className="text-sm font-bold text-slate-800 dark:text-white mt-0.5">{formatCurrency(predictedBalance, currency)}</h4>
            </div>
          </div>
          <p className="mt-4 text-[11px] font-semibold text-slate-450 dark:text-slate-500">Estimated remaining wallet balance at the end of the current month cycle.</p>
        </motion.div>

      </div>
    </section>
  )
}

export default AIInsights
