import { motion } from 'framer-motion'
import { CreditCard, BarChart3, Search, Sparkles } from 'lucide-react'

function EmptyState({ variant = 'generic', message, loading }) {
  const details = {
    transactions: {
      title: message || 'No transactions yet',
      subtitle: 'Start adding income or expenses to activate your dashboard.',
      icon: CreditCard,
      color: 'text-indigo-500',
      bg: 'bg-indigo-500/10',
    },
    analytics: {
      title: message || 'No analytics data',
      subtitle: 'Add transactions to generate charts and category insights.',
      icon: BarChart3,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
    },
    search: {
      title: message || 'No search results',
      subtitle: 'Try adjusting search terms or filters to find what you need.',
      icon: Search,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
    },
    generic: {
      title: message || 'Nothing to show here',
      subtitle: 'Add content or change your filters to reveal insights.',
      icon: Sparkles,
      color: 'text-violet-500',
      bg: 'bg-violet-500/10',
    },
  }

  const state = details[variant] || details.generic
  const IconComponent = state.icon

  return (
    <div className="grid min-h-[380px] place-items-center rounded-[2rem] border border-dashed border-slate-200 bg-white/60 p-8 text-center shadow-soft backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/40">
      {loading ? (
        <div className="w-full max-w-sm space-y-5">
          <div className="mx-auto h-20 w-20 rounded-2xl bg-slate-100 dark:bg-slate-900 animate-pulse flex items-center justify-center">
            <div className="h-8 w-8 rounded bg-slate-200 dark:bg-slate-800" />
          </div>
          <div className="space-y-2.5">
            <div className="mx-auto h-4 w-40 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
            <div className="mx-auto h-3 w-56 rounded bg-slate-150 dark:bg-slate-800/80 animate-pulse" />
          </div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 25 }}
          className="max-w-sm"
        >
          <div className={`mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-2xl ${state.bg} ${state.color} shadow-lg`}>
            <IconComponent className="h-10 w-10" />
          </div>
          <h3 className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">{state.title}</h3>
          <p className="mt-2 text-xs font-semibold leading-relaxed text-slate-400 dark:text-slate-500">{state.subtitle}</p>
        </motion.div>
      )}
    </div>
  )
}

export default EmptyState
