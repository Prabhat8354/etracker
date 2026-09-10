import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, UserCheck, Calendar, DollarSign, Info } from 'lucide-react'
import toast from 'react-hot-toast'
import { useTripContext } from '../../context/TripContext.jsx'
import { SUPPORTED_CURRENCIES, DEFAULT_CURRENCY } from '../../utils/currency.js'

const currencyOptions = SUPPORTED_CURRENCIES.map((c) => c.code)

export default function AddPersonalExpenseModal({ open, onClose, trip, participants = [], initialExpense }) {
  const { addExpense, updateExpense } = useTripContext()
  const isEdit = Boolean(initialExpense)

  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState(trip?.currency || DEFAULT_CURRENCY)
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [notes, setNotes] = useState('')
  const [syncToPersonal, setSyncToPersonal] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Current user participant
  const meParticipant = participants.find((p) => p.isCurrentUser)

  useEffect(() => {
    if (open && trip) {
      if (initialExpense) {
        setDescription(initialExpense.description || '')
        setAmount(String(initialExpense.amount || ''))
        setCurrency(initialExpense.currency || trip.currency || DEFAULT_CURRENCY)
        setDate(initialExpense.date || new Date().toISOString().slice(0, 10))
        setNotes(initialExpense.notes || '')
        setSyncToPersonal(false)
      } else {
        setDescription('')
        setAmount('')
        setCurrency(trip.currency || DEFAULT_CURRENCY)
        setDate(new Date().toISOString().slice(0, 10))
        setNotes('')
        setSyncToPersonal(true)
      }
    }
  }, [open, trip, initialExpense])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const numAmount = Number(amount)

    if (!description.trim()) {
      toast.error('Please enter an expense title.')
      return
    }

    if (!numAmount || numAmount <= 0) {
      toast.error('Amount must be greater than 0.')
      return
    }

    const payerId = meParticipant?.id || participants[0]?.id

    setSubmitting(true)
    try {
      const payload = {
        description,
        amount: numAmount,
        currency,
        paidBy: payerId,
        splitType: 'equal',
        participants: [payerId],
        shares: { [payerId]: numAmount },
        date,
        notes,
        isPersonal: true,
        syncToPersonal: !isEdit && syncToPersonal,
      }

      if (isEdit) {
        const ok = await updateExpense(trip.id, initialExpense.id, payload)
        if (ok) onClose()
      } else {
        const id = await addExpense(trip.id, payload)
        if (id) onClose()
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (!open) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', stiffness: 350, damping: 28 }}
          className="relative z-10 w-full max-w-lg rounded-[2.5rem] border border-slate-200/40 bg-white/95 p-6 sm:p-8 shadow-2xl backdrop-blur-xl dark:border-white/[0.05] dark:bg-slate-950/95"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-200/50 dark:border-white/[0.05]">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-500 text-white shadow-md shadow-purple-500/20">
                <UserCheck className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold tracking-tight text-slate-800 dark:text-white">
                  {isEdit ? 'Edit Personal Expense' : 'Add Personal Trip Expense'}
                </h3>
                <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                  Track individual spending that does not affect group split
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition hover:bg-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Banner Info */}
          <div className="mt-4 flex items-start gap-2.5 rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-3.5 text-xs text-indigo-700 dark:text-indigo-300">
            <Info className="h-4 w-4 shrink-0 mt-0.5" />
            <span>
              Personal expenses are tracked only for your records. They will <strong>NOT</strong> affect what friends owe or receive.
            </span>
          </div>

          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            {/* Description */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
                Expense Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Headphones, Souvenir, Personal snack"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs font-bold text-slate-800 placeholder-slate-400 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:placeholder-slate-600"
              />
            </div>

            {/* Amount & Currency */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
                  Amount *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base font-extrabold text-slate-800 placeholder-slate-400 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
                  Currency
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-3 text-xs font-bold text-slate-800 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                >
                  {currencyOptions.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Date */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
                Date
              </label>
              <div className="relative">
                <Calendar className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-xs font-bold text-slate-800 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
                Notes (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="Personal notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:placeholder-slate-600 resize-none"
              />
            </div>

            {/* Sync to Personal Transactions Checkbox (only on new) */}
            {!isEdit && (
              <label className="flex items-center gap-2.5 pt-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={syncToPersonal}
                  onChange={(e) => setSyncToPersonal(e.target.checked)}
                  className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Also add to my Personal Transactions (eTracker Dashboard)
                </span>
              </label>
            )}

            {/* Actions */}
            <div className="mt-6 pt-4 border-t border-slate-200/50 dark:border-white/[0.05] flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 px-6 py-3 text-xs font-extrabold uppercase tracking-wider text-white shadow-lg shadow-purple-500/20 transition hover:brightness-105 disabled:opacity-50"
              >
                {submitting ? 'Saving...' : isEdit ? 'Save Expense' : 'Add Personal Expense'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
