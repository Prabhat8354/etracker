import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle2, ArrowRight, DollarSign, Calendar } from 'lucide-react'
import toast from 'react-hot-toast'
import { useTripContext } from '../../context/TripContext.jsx'
import { formatCurrency } from '../../utils/currency.js'

export default function SettleUpModal({
  open,
  onClose,
  trip,
  participants = [],
  balances = [],
  simplifiedDebts = [],
  initialSettlement,
}) {
  const { addSettlement } = useTripContext()

  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (open && trip) {
      if (initialSettlement) {
        setFrom(initialSettlement.from || '')
        setTo(initialSettlement.to || '')
        setAmount(String(initialSettlement.amount || ''))
        setDate(new Date().toISOString().slice(0, 10))
        setNotes(initialSettlement.notes || 'Direct payment / settled')
      } else {
        const meParticipant = participants.find((p) => p.isCurrentUser)
        const myDebt = simplifiedDebts.find((d) => d.from === meParticipant?.id)
        const myCredit = simplifiedDebts.find((d) => d.to === meParticipant?.id)
        const firstDebt = simplifiedDebts[0]

        if (myDebt) {
          setFrom(myDebt.from)
          setTo(myDebt.to)
          setAmount(String(myDebt.amount || ''))
          setNotes(`Settling balance with ${myDebt.toName}`)
        } else if (myCredit) {
          setFrom(myCredit.from)
          setTo(myCredit.to)
          setAmount(String(myCredit.amount || ''))
          setNotes(`Payment received from ${myCredit.fromName}`)
        } else if (firstDebt) {
          setFrom(firstDebt.from)
          setTo(firstDebt.to)
          setAmount(String(firstDebt.amount || ''))
          setNotes(`Settling debt from ${firstDebt.fromName} to ${firstDebt.toName}`)
        } else {
          const otherParticipant = participants.find((p) => !p.isCurrentUser)
          setFrom(meParticipant?.id || participants[0]?.id || '')
          setTo(otherParticipant?.id || participants[1]?.id || '')
          setAmount('')
          setNotes('Settled')
        }
        setDate(new Date().toISOString().slice(0, 10))
      }
    }
  }, [open, trip, initialSettlement, participants, simplifiedDebts])

  const fromParticipant = participants.find((p) => p.id === from)
  const toParticipant = participants.find((p) => p.id === to)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const numAmount = Number(amount)

    if (!from || !to) {
      toast.error('Please select both payer and receiver.')
      return
    }

    if (from === to) {
      toast.error('Payer and receiver cannot be the same person.')
      return
    }

    if (!numAmount || numAmount <= 0) {
      toast.error('Amount must be greater than 0.')
      return
    }

    setSubmitting(true)
    try {
      const ok = await addSettlement(trip.id, {
        from,
        fromName: fromParticipant?.name || fromParticipant?.displayName || 'Someone',
        to,
        toName: toParticipant?.name || toParticipant?.displayName || 'Someone',
        amount: numAmount,
        currency: trip.currency || 'INR',
        date,
        notes,
      })
      if (ok) onClose()
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
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-500 text-white shadow-md shadow-teal-500/20">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold tracking-tight text-slate-800 dark:text-white">
                  Record Settlement
                </h3>
                <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                  Mark an outstanding balance as paid
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

          {/* Payment Visual Summary */}
          <div className="mt-4 flex items-center justify-between rounded-2xl border border-teal-500/20 bg-teal-500/5 p-4">
            <div className="text-left">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Payer</p>
              <p className="text-xs font-extrabold text-slate-800 dark:text-white truncate max-w-[120px]">
                {fromParticipant?.name || 'Someone'} {fromParticipant?.isCurrentUser ? '(Me)' : ''}
              </p>
            </div>
            <div className="flex flex-col items-center">
              <ArrowRight className="h-4 w-4 text-teal-500" />
              <span className="text-[10px] font-extrabold text-teal-600 dark:text-teal-400">
                {amount ? formatCurrency(Number(amount), trip?.currency || 'INR') : 'Pays'}
              </span>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Receiver</p>
              <p className="text-xs font-extrabold text-slate-800 dark:text-white truncate max-w-[120px]">
                {toParticipant?.name || 'Someone'} {toParticipant?.isCurrentUser ? '(Me)' : ''}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            {/* Who Paid & Who Received */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
                  Who Paid? (Debtor)
                </label>
                <select
                  required
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-800 shadow-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                >
                  {participants.map((p) => {
                    const b = balances.find((bal) => bal.id === p.id)
                    let statusLabel = ''
                    if (b) {
                      if (b.netBalance > 0.01) {
                        statusLabel = ` (Creditor: +${formatCurrency(b.netBalance, trip?.currency || 'INR')})`
                      } else if (b.netBalance < -0.01) {
                        statusLabel = ` (Debtor: ${formatCurrency(b.netBalance, trip?.currency || 'INR')})`
                      } else {
                        statusLabel = ' (Settled)'
                      }
                    }
                    return (
                      <option key={p.id} value={p.id}>
                        {p.name} {p.isCurrentUser ? '(Me)' : ''}{statusLabel}
                      </option>
                    )
                  })}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
                  Who Received? (Creditor)
                </label>
                <select
                  required
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-800 shadow-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                >
                  {participants.map((p) => {
                    const b = balances.find((bal) => bal.id === p.id)
                    let statusLabel = ''
                    if (b) {
                      if (b.netBalance > 0.01) {
                        statusLabel = ` (Creditor: +${formatCurrency(b.netBalance, trip?.currency || 'INR')})`
                      } else if (b.netBalance < -0.01) {
                        statusLabel = ` (Debtor: ${formatCurrency(b.netBalance, trip?.currency || 'INR')})`
                      } else {
                        statusLabel = ' (Settled)'
                      }
                    }
                    return (
                      <option key={p.id} value={p.id}>
                        {p.name} {p.isCurrentUser ? '(Me)' : ''}{statusLabel}
                      </option>
                    )
                  })}
                </select>
              </div>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
                Amount Paid ({trip?.currency || 'INR'}) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base font-extrabold text-slate-800 placeholder-slate-400 shadow-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
              />
            </div>

            {/* Date */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
                Settlement Date
              </label>
              <div className="relative">
                <Calendar className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-xs font-bold text-slate-800 shadow-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
                Payment Method / Notes
              </label>
              <input
                type="text"
                placeholder="e.g. Google Pay, PhonePe, Cash, Bank Transfer"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-medium text-slate-800 placeholder-slate-400 shadow-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:placeholder-slate-600"
              />
            </div>

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
                className="rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-600 px-6 py-3 text-xs font-extrabold uppercase tracking-wider text-white shadow-lg shadow-teal-500/20 transition hover:brightness-105 disabled:opacity-50"
              >
                {submitting ? 'Recording...' : 'Mark as Settled ✓'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
