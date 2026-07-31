import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { FiPlus, FiX } from 'react-icons/fi'
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
  const { addTransaction, updateTransaction } = useExpenseContext()
  const [localOpen, setLocalOpen] = useState(false)
  const [transaction, setTransaction] = useState(initialTransaction ?? defaultTransaction)
  const isControlled = openProp !== undefined && typeof onOpenChange === 'function'
  const modalOpen = isControlled ? openProp : localOpen
  const isEditMode = Boolean(initialTransaction)
  const buttonLabel = triggerLabel || (isEditMode ? 'Edit transaction' : 'Add Transaction')

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
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center justify-center rounded-3xl bg-gradient-to-r from-indigo-500 to-violet-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/15 transition hover:scale-[1.01]"
        >
          <FiPlus className="h-4 w-4" />
          <span>{buttonLabel}</span>
        </button>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="w-full max-w-2xl rounded-[2rem] border border-slate-200/80 bg-white p-8 shadow-soft backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                  {isEditMode ? 'Edit transaction' : 'New transaction'}
                </h2>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Log income or expense with detailed notes and categories.</p>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="mt-8 grid gap-6 sm:grid-cols-2">
              <label className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                Title
                <input
                  value={transaction.title}
                  onChange={(event) => setTransaction({ ...transaction, title: event.target.value })}
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-600/20"
                  placeholder="Project payment"
                />
              </label>
              <label className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                Amount
                <input
                  value={transaction.amount}
                  onChange={(event) => setTransaction({ ...transaction, amount: event.target.value })}
                  type="number"
                  min="0"
                  step="0.01"
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-600/20"
                  placeholder="1200"
                />
              </label>
              <label className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                Category
                <select
                  value={transaction.category}
                  onChange={(event) => setTransaction({ ...transaction, category: event.target.value })}
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-600/20"
                >
                  {sampleCategories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </label>
              <label className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                Type
                <select
                  value={transaction.type}
                  onChange={(event) => setTransaction({ ...transaction, type: event.target.value })}
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-600/20"
                >
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
              </label>
              <label className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                Date
                <input
                  value={transaction.date}
                  onChange={(event) => setTransaction({ ...transaction, date: event.target.value })}
                  type="date"
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-600/20"
                />
              </label>
              <label className="sm:col-span-2 space-y-2 text-sm text-slate-700 dark:text-slate-300">
                Notes
                <textarea
                  value={transaction.notes}
                  onChange={(event) => setTransaction({ ...transaction, notes: event.target.value })}
                  rows={4}
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-600/20"
                  placeholder="Optional description"
                />
              </label>
              <div className="sm:col-span-2 flex flex-col gap-3 text-right">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-3xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-3xl bg-gradient-to-r from-indigo-500 to-violet-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/15 transition hover:scale-[1.01]"
                >
                  {isEditMode ? 'Update Transaction' : 'Save Transaction'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </>
  )
}

export default AddTransactionModal
