function Loader({ notFound }) {
  if (notFound) {
    return (
      <div className="grid min-h-[70vh] place-items-center text-center">
        <div className="rounded-[2rem] border border-slate-200/70 bg-white/90 px-10 py-12 shadow-soft dark:border-slate-800/70 dark:bg-slate-900/90">
          <p className="text-sm uppercase tracking-[0.35em] text-slate-400 dark:text-slate-500">404</p>
          <h1 className="mt-3 text-4xl font-semibold text-slate-900 dark:text-slate-100">Page Not Found</h1>
          <p className="mt-4 max-w-xl text-slate-600 dark:text-slate-400">The page you’re looking for doesn’t exist. Return to dashboard and explore your finances instead.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid min-h-[70vh] place-items-center text-center">
      <div className="animate-pulse rounded-[2rem] border border-slate-200/70 bg-white/90 px-10 py-12 shadow-soft dark:border-slate-800/70 dark:bg-slate-900/90">
        <div className="mb-4 h-10 rounded-3xl bg-slate-200/80 dark:bg-slate-800/80" />
        <div className="mx-auto h-6 w-52 rounded-3xl bg-slate-200/80 dark:bg-slate-800/80" />
        <div className="mt-4 h-4 w-72 rounded-3xl bg-slate-200/80 dark:bg-slate-800/80" />
      </div>
    </div>
  )
}

export default Loader
