import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle } from 'lucide-react'

function DeleteModal({ title, message, onConfirm, onCancel }) {
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onCancel}
          className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
        />

        {/* Modal Alert Box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
          className="relative z-10 w-full max-w-md rounded-[2rem] border border-slate-200/50 bg-white/95 p-8 shadow-2xl backdrop-blur-md dark:border-slate-800/50 dark:bg-slate-950/95"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">{title}</h2>
              <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">Danger Zone Action</p>
            </div>
          </div>

          <p className="mt-4 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            {message}
          </p>

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 transition hover:bg-slate-50 hover:text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 px-5 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-rose-500/20 transition hover:brightness-105"
            >
              Confirm Delete
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default DeleteModal
