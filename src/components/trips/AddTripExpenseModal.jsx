import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, DollarSign, Calendar, Users, FileText, Check, AlertCircle, Percent, Tag } from 'lucide-react'
import toast from 'react-hot-toast'
import { useTripContext } from '../../context/TripContext.jsx'
import { calculateEqualShares, validateCustomShares, round2 } from '../../services/tripSettlementEngine.js'
import { formatCurrency } from '../../utils/currency.js'

const currencyOptions = ['INR', 'USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'AED', 'SAR', 'SGD']
const categoryOptions = ['Food', 'Stay', 'Travel', 'Activity', 'Shopping', 'Other']

export default function AddTripExpenseModal({ open, onClose, trip, participants = [], initialExpense }) {
  const { addExpense, updateExpense } = useTripContext()
  const isEdit = Boolean(initialExpense)

  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState(trip?.currency || 'INR')
  const [category, setCategory] = useState('Food')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [paidBy, setPaidBy] = useState('')
  const [selectedParticipants, setSelectedParticipants] = useState([])
  const [splitType, setSplitType] = useState('equal')
  const [customShares, setCustomShares] = useState({})
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Initialize or reset form state on open
  useEffect(() => {
    if (open && trip) {
      if (initialExpense) {
        setDescription(initialExpense.description || '')
        setAmount(String(initialExpense.amount || ''))
        setCurrency(initialExpense.currency || trip.currency || 'INR')
        setCategory(initialExpense.category || 'Food')
        setDate(initialExpense.date || new Date().toISOString().slice(0, 10))
        setPaidBy(initialExpense.paidBy || '')
        setSelectedParticipants(initialExpense.participants || [])
        setSplitType(initialExpense.splitType || 'equal')
        setCustomShares(initialExpense.shares || initialExpense.customSplits || {})
        setNotes(initialExpense.notes || '')
      } else {
        setDescription('')
        setAmount('')
        setCurrency(trip.currency || 'INR')
        setCategory('Food')
        setDate(new Date().toISOString().slice(0, 10))
        // Default paidBy to current user if available, otherwise first participant
        const meParticipant = participants.find((p) => p.isCurrentUser)
        setPaidBy(meParticipant ? meParticipant.id : participants[0]?.id || '')
        // Default selected participants to all participants
        setSelectedParticipants(participants.map((p) => p.id))
        setSplitType('equal')
        setCustomShares({})
        setNotes('')
      }
    }
  }, [open, trip, initialExpense, participants])

  // Equal split calculation
  const equalShares = useMemo(() => {
    if (splitType !== 'equal') return {}
    return calculateEqualShares(Number(amount), selectedParticipants)
  }, [splitType, amount, selectedParticipants])

  // Custom split validation
  const customValidation = useMemo(() => {
    if (splitType !== 'custom') return { isValid: true, sum: 0, remaining: 0 }
    return validateCustomShares(Number(amount), customShares, selectedParticipants)
  }, [splitType, amount, customShares, selectedParticipants])

  const toggleParticipant = (pId) => {
    if (selectedParticipants.includes(pId)) {
      if (selectedParticipants.length === 1) {
        toast.error('At least one member must share the expense.')
        return
      }
      setSelectedParticipants(selectedParticipants.filter((id) => id !== pId))
    } else {
      setSelectedParticipants([...selectedParticipants, pId])
    }
  }

  const selectAllParticipants = () => {
    setSelectedParticipants(participants.map((p) => p.id))
  }

  const handleCustomShareChange = (pId, val) => {
    setCustomShares((prev) => ({
      ...prev,
      [pId]: val,
    }))
  }

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

    if (!paidBy) {
      toast.error('Please select who paid for this expense.')
      return
    }

    if (selectedParticipants.length === 0) {
      toast.error('At least one participant must share this expense.')
      return
    }

    let finalShares = {}
    if (splitType === 'equal') {
      finalShares = equalShares
    } else {
      if (!customValidation.isValid) {
        toast.error(`Custom split totals do not match total expense. Remaining: ${customValidation.remaining}`)
        return
      }
      selectedParticipants.forEach((id) => {
        finalShares[id] = round2(parseFloat(customShares[id]) || 0)
      })
    }

    const payer = participants.find((p) => p.id === paidBy)
    const paidByName = payer?.name || payer?.displayName || 'Member'

    setSubmitting(true)
    try {
      const payload = {
        description,
        amount: numAmount,
        currency,
        category,
        paidBy,
        paidByName,
        splitType,
        participants: selectedParticipants,
        shares: finalShares,
        customSplits: splitType === 'custom' ? finalShares : {},
        date,
        notes,
        isPersonal: false,
      }

      if (isEdit) {
        const ok = await updateExpense(trip.id, initialExpense.id, payload, initialExpense)
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
          className="relative z-10 w-full max-w-xl rounded-[2.5rem] border border-slate-200/40 bg-white/95 p-6 sm:p-8 shadow-2xl backdrop-blur-xl dark:border-white/[0.05] dark:bg-slate-950/95 max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-200/50 dark:border-white/[0.05]">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/20">
                <DollarSign className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold tracking-tight text-slate-800 dark:text-white">
                  {isEdit ? 'Edit Shared Expense' : 'Add Trip Expense'}
                </h3>
                <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                  Shared across group members in real-time
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

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {/* Title / Description */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
                Expense Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Hotel stay, Beach lunch, Scuba diving"
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
                <div className="relative">
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

            {/* Category & Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-800 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                >
                  {categoryOptions.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

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
            </div>

            {/* Paid By */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
                Paid By (Who actually paid?) *
              </label>
              <select
                required
                value={paidBy}
                onChange={(e) => setPaidBy(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-800 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
              >
                {participants.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} {p.isCurrentUser ? '(Me)' : ''} {p.email ? `(${p.email})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Who is this expense for? */}
            <div className="pt-2 border-t border-slate-100 dark:border-white/[0.03]">
              <div className="flex items-center justify-between mb-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Who is this expense for? ({selectedParticipants.length}/{participants.length})
                </label>
                <button
                  type="button"
                  onClick={selectAllParticipants}
                  className="text-[10px] font-extrabold text-indigo-500 hover:text-indigo-600 transition"
                >
                  Select Everyone
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {participants.map((p) => {
                  const isSelected = selectedParticipants.includes(p.id)
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => toggleParticipant(p.id)}
                      className={`flex items-center justify-between p-2.5 rounded-2xl border text-xs font-bold transition ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                          : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        {p.photoURL ? (
                          <img src={p.photoURL} alt={p.name} className="h-5 w-5 rounded-full object-cover shrink-0" />
                        ) : (
                          <div className="h-5 w-5 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-[9px] font-black shrink-0">
                            {p.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span className="truncate">{p.name} {p.isCurrentUser ? '(Me)' : ''}</span>
                      </div>
                      {isSelected ? (
                        <Check className="h-3.5 w-3.5 shrink-0 ml-1 text-indigo-500" />
                      ) : (
                        <span className="h-3.5 w-3.5 shrink-0 rounded-full border border-slate-300 dark:border-slate-700 ml-1" />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Split Type */}
            <div className="pt-2">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                Split Type
              </label>
              <div className="flex rounded-2xl border border-slate-200 bg-slate-100 p-1 dark:border-slate-800 dark:bg-slate-900">
                <button
                  type="button"
                  onClick={() => setSplitType('equal')}
                  className={`flex-1 rounded-xl py-2 text-xs font-extrabold uppercase tracking-wider transition ${
                    splitType === 'equal'
                      ? 'bg-white text-slate-800 shadow-sm dark:bg-slate-800 dark:text-white'
                      : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  Equal Split
                </button>
                <button
                  type="button"
                  onClick={() => setSplitType('custom')}
                  className={`flex-1 rounded-xl py-2 text-xs font-extrabold uppercase tracking-wider transition ${
                    splitType === 'custom'
                      ? 'bg-white text-slate-800 shadow-sm dark:bg-slate-800 dark:text-white'
                      : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  Custom Split
                </button>
              </div>
            </div>

            {/* Split Breakdown */}
            {splitType === 'equal' ? (
              <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-3.5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400">
                    {selectedParticipants.length > 0 && Number(amount) > 0
                      ? `${formatCurrency(round2(Number(amount) / selectedParticipants.length), currency)} each`
                      : 'Enter amount to see split'}
                  </p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                    Split equally among {selectedParticipants.length} selected member(s)
                  </p>
                </div>
                <span className="text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                  Equal
                </span>
              </div>
            ) : (
              <div className="space-y-2.5 rounded-2xl border border-slate-200 bg-slate-50/50 p-3.5 dark:border-slate-800 dark:bg-slate-900/40">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-500 dark:text-slate-400">Custom Shares:</span>
                  {customValidation.isValid ? (
                    <span className="text-emerald-500 font-extrabold flex items-center gap-1">
                      <Check className="h-3.5 w-3.5" /> Split complete ✓
                    </span>
                  ) : (
                    <span className="text-rose-500 font-extrabold flex items-center gap-1">
                      <AlertCircle className="h-3.5 w-3.5" />
                      Remaining: {formatCurrency(customValidation.remaining, currency)}
                    </span>
                  )}
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {selectedParticipants.map((pId) => {
                    const participant = participants.find((p) => p.id === pId)
                    return (
                      <div key={pId} className="flex items-center justify-between gap-3">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">
                          {participant?.name || 'Member'} {participant?.isCurrentUser ? '(Me)' : ''}
                        </span>
                        <div className="relative w-36">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            value={customShares[pId] ?? ''}
                            onChange={(e) => handleCustomShareChange(pId, e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-right text-slate-800 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Notes */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
                Notes (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="Details, receipt notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:placeholder-slate-600 resize-none"
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
                disabled={submitting || (splitType === 'custom' && !customValidation.isValid)}
                className="rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-3 text-xs font-extrabold uppercase tracking-wider text-white shadow-lg shadow-emerald-500/20 transition hover:brightness-105 disabled:opacity-50"
              >
                {submitting ? 'Saving...' : isEdit ? 'Save Expense' : 'Add Expense'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
