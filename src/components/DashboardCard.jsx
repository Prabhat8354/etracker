import { AnimatePresence, motion } from 'framer-motion'
import { formatCurrency } from '../utils/helpers.jsx'

function DashboardCard({ label, value, percentage, icon, gradient }) {
  return (
    <motion.article
      layout
      whileHover={{ y: -4 }}
      className="rounded-[2rem] border border-slate-200/80 bg-white/90 p-6 shadow-soft backdrop-blur-xl transition duration-300 hover:shadow-glow dark:border-slate-800/80 dark:bg-slate-950/90"
    >
      <div className="flex items-center justify-between gap-4">
        <span className={`inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-gradient-to-br ${gradient} text-white shadow-lg shadow-slate-300/20`}>
          {icon}
        </span>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-slate-500 dark:bg-slate-900 dark:text-slate-300">{percentage}</span>
      </div>
      <div className="mt-8">
        <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
        <AnimatePresence mode="wait">
          <motion.p
            key={value}
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.4 }}
            className="mt-3 text-3xl font-semibold text-slate-900 dark:text-slate-100"
          >
            {formatCurrency(value)}
          </motion.p>
        </AnimatePresence>
      </div>
    </motion.article>
  )
}

export default DashboardCard
