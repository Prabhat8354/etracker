import { motion } from 'framer-motion'
import { DollarSign, ShieldAlert, ShieldCheck, TrendingUp, Clock } from 'lucide-react'
import { useExpenseContext } from '../context/ExpenseContext.jsx'
import { formatCurrency } from '../utils/helpers.jsx'

function QuickStats({ summary }) {
  const { settings } = useExpenseContext()
  const currency = settings?.currency || 'USD'

  const formatVal = (val) => {
    return formatCurrency(val, currency)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut', delay: 0.15 }}
      className="glass-card rounded-[2rem] p-8"
    >
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Quick stats</p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Performance snapshot</h2>
      </div>
      <div className="mt-8 space-y-4">
        <StatTile
          icon={<DollarSign className="h-5 w-5 text-indigo-500" />}
          label="Net balance"
          value={formatVal(summary.balance)}
        />
        <StatTile
          icon={<ShieldCheck className="h-5 w-5 text-emerald-500" />}
          label="Safe savings"
          value={formatVal(summary.savings)}
        />
        <StatTile
          icon={<Clock className="h-5 w-5 text-amber-500" />}
          label="Projected growth"
          value="+18% this month"
        />
      </div>
    </motion.div>
  )
}

function StatTile({ icon, label, value }) {
  return (
    <motion.div
      whileHover={{ x: 4 }}
      className="flex items-center justify-between rounded-2xl border border-slate-200/50 bg-slate-50/50 px-5 py-4 dark:border-slate-800/40 dark:bg-slate-900/30 transition-colors duration-200"
    >
      <div className="flex items-center gap-4">
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white shadow-sm dark:bg-slate-950">
          {icon}
        </span>
        <div>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{label}</p>
          <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">{value}</p>
        </div>
      </div>
    </motion.div>
  )
}

export default QuickStats
