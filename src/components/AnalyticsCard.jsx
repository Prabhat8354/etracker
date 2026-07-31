function AnalyticsCard({ title, value, description }) {
  return (
    <article className="rounded-[2rem] border border-slate-200/80 bg-gradient-to-br from-slate-50 via-white to-slate-50 p-6 shadow-soft dark:border-slate-800/80 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">
      <p className="text-sm uppercase tracking-[0.35em] text-slate-400 dark:text-slate-500">{title}</p>
      <p className="mt-4 text-3xl font-semibold text-slate-900 dark:text-slate-100">{value}</p>
      <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{description}</p>
    </article>
  )
}

export default AnalyticsCard
