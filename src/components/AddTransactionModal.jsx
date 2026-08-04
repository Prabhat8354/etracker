import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, Type, DollarSign, Calendar, Tag, FileText } from 'lucide-react'
import { useExpenseContext } from '../context/ExpenseContext.jsx'
import { v4 as uuidv4 } from 'uuid'
import toast from 'react-hot-toast'
import { sampleCategories } from '../data/sampleData.jsx'

const defaultTransaction = {
  title: '',
  amount: '',
  category: 'Salary',
  type: 'income',
  date: new Date().toISOString().slice(0, 10),
  notes: '',
}

function AddTransactionModal({ open: openProp, onOpenChange, hideTrigger, initialTransaction, triggerLabel }) {
  const { addTransaction, updateTransaction, settings } = useExpenseContext()
  const [localOpen, setLocalOpen] = useState(false)
  const [transaction, setTransaction] = useState(initialTransaction ?? defaultTransaction)
  
  const isControlled = openProp !== undefined && typeof onOpenChange === 'function'
  const modalOpen = isControlled ? openProp : localOpen
  const isEditMode = Boolean(initialTransaction)
  const buttonLabel = triggerLabel || (isEditMode ? 'Edit transaction' : 'Add Transaction')
  const currency = settings?.currency || 'USD'

  useEffect(() => {
    if (modalOpen) {
      setTransaction(initialTransaction ?? defaultTransaction)
    }
  }, [modalOpen, initialTransaction])

  const setModalOpen = (value) => {
    if (isControlled) {
      onOpenChange(value)
    } else {
      setLocalOpen(value)
    }
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!transaction.title || !transaction.amount || !transaction.category || !transaction.date) {
      toast.error('Please complete all required fields.')
      return
    }
    if (Number(transaction.amount) <= 0) {
      toast.error('Amount must be a positive number.')
      return
    }

    if (isEditMode) {
      updateTransaction({ ...transaction, amount: Number(transaction.amount) })
    } else {
      addTransaction({ ...transaction, id: uuidv4(), amount: Number(transaction.amount) })
    }

    setModalOpen(false)
  }

  return (
    <>
      {!hideTrigger && (
        <motion.button
          type="button"
          onClick={() => setModalOpen(true)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-650 px-5 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-indigo-500/20 transition hover:brightness-105"
        >
          <Plus className="h-4.5 w-4.5" />
          <span>{buttonLabel}</span>
        </motion.button>
      )}

      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setModalOpen(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              className="relative z-10 w-full max-w-lg rounded-[2rem] border border-slate-200/30 bg-white/95 p-8 shadow-2xl backdrop-blur-md dark:border-white/[0.03] dark:bg-slate-950/95"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-extrabold tracking-tight text-slate-850 dark:text-white">
                    {isEditMode ? 'Edit Transaction' : 'New Transaction'}
                  </h2>
                  <p className="mt-1 text-xs font-semibold text-slate-450 dark:text-slate-500">
                    Enter transaction values and records securely.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100/50 text-slate-450 transition hover:bg-slate-100 hover:text-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="mt-7 space-y-5">
                
                {/* Title Input with Floating Label */}
                <div className="relative">
                  <input
                    type="text"
                    id="tx-title"
                    value={transaction.title}
                    onChange={(event) => setTransaction({ ...transaction, title: event.target.value })}
                    className="peer w-full rounded-2xl border border-slate-200/60 bg-slate-50/50 px-4 pt-6 pb-2 text-sm font-semibold text-slate-800 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 dark:border-white/[0.04] dark:bg-slate-900/30 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:bg-slate-950 placeholder-transparent"
                    placeholder="Title"
                    required
                  />
                  <label
                    htmlFor="tx-title"
                    className="absolute left-4 top-2 text-[9px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-xs peer-placeholder-shown:font-semibold peer-focus:top-2 peer-focus:text-[9px] peer-focus:font-black peer-focus:text-indigo-500 pointer-events-none"
                  >
                    Title / Item description
                  </label>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  
                  {/* Amount Input with Floating Label */}
                  <div className="relative">
                    <input
                      type="number"
                      id="tx-amount"
                      value={transaction.amount}
                      onChange={(event) => setTransaction({ ...transaction, amount: event.target.value })}
                      min="0"
                      step="0.01"
                      className="peer w-full rounded-2xl border border-slate-200/60 bg-slate-50/50 px-4 pt-6 pb-2 text-sm font-semibold text-slate-800 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 dark:border-white/[0.04] dark:bg-slate-900/30 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:bg-slate-950 placeholder-transparent"
                      placeholder="Amount"
                      required
                    />
                    <label
                      htmlFor="tx-amount"
                      className="absolute left-4 top-2 text-[9px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-xs peer-placeholder-shown:font-semibold peer-focus:top-2 peer-focus:text-[9px] peer-focus:font-black peer-focus:text-indigo-500 pointer-events-none"
                    >
                      Amount ({currency})
                    </label>
                  </div>

                  {/* Date Input with Floating Label */}
                  <div className="relative">
                    <input
                      type="date"
                      id="tx-date"
                      value={transaction.date}
                      onChange={(event) => setTransaction({ ...transaction, date: event.target.value })}
                      className="peer w-full rounded-2xl border border-slate-200/60 bg-slate-50/50 px-4 pt-6 pb-2 text-sm font-semibold text-slate-800 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 dark:border-white/[0.04] dark:bg-slate-900/30 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:bg-slate-950 placeholder-transparent"
                      placeholder="Date"
                      required
                    />
                    <label
                      htmlFor="tx-date"
                      className="absolute left-4 top-2 text-[9px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-xs peer-placeholder-shown:font-semibold peer-focus:top-2 peer-focus:text-[9px] peer-focus:font-black peer-focus:text-indigo-500 pointer-events-none"
                    >
                      Calendar Date
                    </label>
                  </div>

                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  
                  {/* Category Dropdown */}
                  <div className="relative">
                    <select
                      id="tx-category"
                      value={transaction.category}
                      onChange={(event) => setTransaction({ ...transaction, category: event.target.value })}
                      className="peer w-full rounded-2xl border border-slate-200/60 bg-slate-50/50 px-4 pt-6 pb-2 text-sm font-semibold text-slate-800 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 dark:border-white/[0.04] dark:bg-slate-900/30 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:bg-slate-950 appearance-none"
                    >
                      {sampleCategories.map((category) => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                    <label
                      htmlFor="tx-category"
                      className="absolute left-4 top-2 text-[9px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 pointer-events-none"
                    >
                      Category
                    </label>
                    <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
                      <Tag className="h-3.5 w-3.5" />
                    </div>
                  </div>

                  {/* Type Dropdown */}
                  <div className="relative">
                    <select
                      id="tx-type"
                      value={transaction.type}
                      onChange={(event) => setTransaction({ ...transaction, type: event.target.value })}
                      className="peer w-full rounded-2xl border border-slate-200/60 bg-slate-50/50 px-4 pt-6 pb-2 text-sm font-semibold text-slate-800 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 dark:border-white/[0.04] dark:bg-slate-900/30 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:bg-slate-950 appearance-none"
                    >
                      <option value="income">Income</option>
                      <option value="expense">Expense</option>
                    </select>
                    <label
                      htmlFor="tx-type"
                      className="absolute left-4 top-2 text-[9px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 pointer-events-none"
                    >
                      Type flow
                    </label>
                    <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
                      <FileText className="h-3.5 w-3.5" />
                    </div>
                  </div>

                </div>

                {/* Notes Input with Floating Label */}
                <div className="relative">
                  <textarea
                    id="tx-notes"
                    value={transaction.notes}
                    onChange={(event) => setTransaction({ ...transaction, notes: event.target.value })}
                    rows={3}
                    className="peer w-full rounded-2xl border border-slate-200/60 bg-slate-50/50 px-4 pt-6 pb-2 text-sm font-semibold text-slate-850 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 dark:border-white/[0.04] dark:bg-slate-900/30 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:bg-slate-950 placeholder-transparent"
                    placeholder="Notes"
                  />
                  <label
                    htmlFor="tx-notes"
                    className="absolute left-4 top-2 text-[9px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-xs peer-placeholder-shown:font-semibold peer-focus:top-2 peer-focus:text-[9px] peer-focus:font-black peer-focus:text-indigo-500 pointer-events-none"
                  >
                    Notes / Description
                  </label>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col-reverse gap-3 pt-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="rounded-xl border border-slate-200/50 bg-white px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 transition hover:bg-slate-50 hover:text-slate-850 dark:border-white/[0.04] dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-gradient-to-r from-indigo-500 to-purple-650 px-5 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-indigo-500/20 transition hover:brightness-105"
                  >
                    {isEditMode ? 'Update Entry' : 'Create Entry'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}

export default AddTransactionModal
