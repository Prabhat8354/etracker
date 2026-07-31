import { motion } from 'framer-motion'
import { FiDollarSign, FiShield, FiClock } from 'react-icons/fi'

function QuickStats({ summary }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut', delay: 0.15 }}
      className="rounded-[2rem] border border-slate-200/80 bg-white/80 p-8 shadow-soft backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950/80"
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-slate-400 dark:text-slate-500">Quick stats</p>
          <h2 className="mt-3 text-2xl font-semibold text-slate-900 dark:text-slate-100">Performance snapshot</h2>
        </div>
      </div>
      <div className="mt-8 space-y-4">
        <StatTile icon={<FiDollarSign className="h-5 w-5" />} label="Net balance" value={`$${summary.balance.toLocaleString()}`} />
        <StatTile icon={<FiShield className="h-5 w-5" />} label="Safe savings" value={`$${summary.savings.toLocaleString()}`} />
        <StatTile icon={<FiClock className="h-5 w-5" />} label="Projected growth" value="+18% this month" />
      </div>
    </motion.div>
  )
}

function StatTile({ icon, label, value }) {
  return (
    <div className="flex items-center justify-between rounded-3xl border border-slate-200/80 bg-slate-50 px-5 py-4 dark:border-slate-800/80 dark:bg-slate-900/80">
      <div className="flex items-center gap-4">
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-3xl bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300">
          {icon}
        </span>
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
          <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-100">{value}</p>
        </div>
      </div>
    </div>
  )
}

export default QuickStats
