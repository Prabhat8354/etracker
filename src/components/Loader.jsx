import { Link } from 'react-router-dom'
import { Loader2, AlertCircle } from 'lucide-react'
import { motion } from 'framer-motion'

function Loader({ notFound }) {
  if (notFound) {
    return (
      <div className="grid min-h-[70vh] place-items-center text-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="glass-card rounded-[2.5rem] max-w-md p-10 shadow-2xl relative overflow-hidden"
        >
          {/* Accent Blob */}
          <div className="absolute -top-10 -right-10 h-28 w-28 rounded-full bg-rose-500/10 blur-xl pointer-events-none" />
          
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500 shadow-sm mb-6">
            <AlertCircle className="h-7 w-7" />
          </div>

          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400 dark:text-slate-500">Error 404</p>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Page Not Found</h1>
          <p className="mt-4 text-xs font-semibold leading-relaxed text-slate-500 dark:text-slate-400">
            The page you are looking for does not exist or has been moved. Let's get you back to your workspace.
          </p>

          <Link
            to="/dashboard"
            className="mt-8 inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-indigo-500/20 transition hover:brightness-105"
          >
            Back to Dashboard
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="grid min-h-[60vh] place-items-center text-center">
      <div className="flex flex-col items-center">
        {/* Modern Premium Spinner */}
        <div className="relative flex h-12 w-12 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-500 dark:text-indigo-400" />
        </div>
        <p className="mt-4 text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Loading Workspace...</p>
      </div>
    </div>
  )
}

export default Loader
