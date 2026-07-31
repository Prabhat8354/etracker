function EmptyState({ variant = 'generic', message, loading }) {
  const details = {
    transactions: {
      title: message || 'No transactions yet',
      subtitle: 'Start adding income or expenses to activate your dashboard.',
      icon: '💳',
    },
    analytics: {
      title: message || 'No analytics data',
      subtitle: 'Add transactions to generate charts and category insights.',
      icon: '📊',
    },
    search: {
      title: message || 'No search results',
      subtitle: 'Try adjusting search terms or filters to find what you need.',
      icon: '🔎',
    },
    generic: {
      title: message || 'Nothing to show here',
      subtitle: 'Add content or change your filters to reveal insights.',
      icon: '✨',
    },
  }

  const state = details[variant] || details.generic

  return (
    <div className="grid min-h-[360px] place-items-center rounded-[2rem] border border-dashed border-slate-300/80 bg-white/80 p-10 text-center shadow-soft backdrop-blur-xl dark:border-slate-700/80 dark:bg-slate-950/80">
      {loading ? (
        <div className="animate-pulse space-y-4">
          <div className="mx-auto h-24 w-24 rounded-full bg-slate-200 dark:bg-slate-800" />
          <div className="h-4 w-48 rounded-full bg-slate-200 dark:bg-slate-800" />
          <div className="h-4 w-72 rounded-full bg-slate-200 dark:bg-slate-800" />
        </div>
      ) : (
        <>
          <div className="mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-4xl shadow-lg shadow-indigo-500/20">
            {state.icon}
          </div>
          <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">{state.title}</p>
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{state.subtitle}</p>
        </>
      )}
    </div>
  )
}

export default EmptyState
