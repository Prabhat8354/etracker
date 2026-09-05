import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Calendar, MapPin, DollarSign, Users, Plus, Navigation } from 'lucide-react'
import toast from 'react-hot-toast'
import { useTripContext } from '../../context/TripContext.jsx'
import { useExpenseContext } from '../../context/ExpenseContext.jsx'

const supportedCurrencies = [
  { code: 'INR', symbol: '₹', label: 'INR (₹) Indian Rupee' },
  { code: 'USD', symbol: '$', label: 'USD ($) US Dollar' },
  { code: 'EUR', symbol: '€', label: 'EUR (€) Euro' },
  { code: 'GBP', symbol: '£', label: 'GBP (£) British Pound' },
  { code: 'JPY', symbol: '¥', label: 'JPY (¥) Japanese Yen' },
  { code: 'CAD', symbol: 'C$', label: 'CAD (C$) Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', label: 'AUD (A$) Australian Dollar' },
  { code: 'AED', symbol: 'AED', label: 'AED UAE Dirham' },
  { code: 'SAR', symbol: 'SR', label: 'SAR Saudi Riyal' },
  { code: 'SGD', symbol: 'S$', label: 'SGD (S$) Singapore Dollar' },
]

export default function CreateTripModal({ open, onClose, initialTrip }) {
  const { createTrip, updateTrip } = useTripContext()
  const { settings } = useExpenseContext() || {}

  const isEdit = Boolean(initialTrip)

  const [name, setName] = useState('')
  const [destination, setDestination] = useState('')
  const [description, setDescription] = useState('')
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10))
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10))
  const [currency, setCurrency] = useState(settings?.currency || 'INR')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      if (initialTrip) {
        setName(initialTrip.name || '')
        setDestination(initialTrip.destination || '')
        setDescription(initialTrip.description || '')
        setStartDate(initialTrip.startDate || new Date().toISOString().slice(0, 10))
        setEndDate(initialTrip.endDate || new Date().toISOString().slice(0, 10))
        setCurrency(initialTrip.currency || 'INR')
      } else {
        setName('')
        setDestination('')
        setDescription('')
        setStartDate(new Date().toISOString().slice(0, 10))
        setEndDate(new Date(Date.now() + 4 * 86400000).toISOString().slice(0, 10))
        setCurrency(settings?.currency || 'INR')
      }
    }
  }, [open, initialTrip, settings?.currency])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error('Please enter a trip name.')
      return
    }

    if (new Date(startDate) > new Date(endDate)) {
      toast.error('End date cannot be before start date.')
      return
    }

    setSubmitting(true)
    try {
      if (isEdit) {
        const ok = await updateTrip(initialTrip.id, {
          name,
          destination,
          description,
          startDate,
          endDate,
          currency,
        })
        if (ok) onClose()
      } else {
        const tripId = await createTrip({
          name,
          destination,
          description,
          startDate,
          endDate,
          currency,
        })
        if (tripId) onClose()
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
          className="relative z-10 w-full max-w-lg rounded-[2.5rem] border border-slate-200/40 bg-white/95 p-6 sm:p-8 shadow-2xl backdrop-blur-xl dark:border-white/[0.05] dark:bg-slate-950/95 max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-200/50 dark:border-white/[0.05]">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 text-white shadow-md shadow-indigo-500/20">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold tracking-tight text-slate-800 dark:text-white">
                  {isEdit ? 'Edit Trip Details' : 'Create Collaborative Trip'}
                </h3>
                <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                  {isEdit ? 'Update your trip information' : 'Track and split shared expenses with friends in real-time'}
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

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {/* Trip Name */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
                Trip Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Goa Trip, Euro Tour, Manali Trek"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs font-bold text-slate-800 placeholder-slate-400 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:placeholder-slate-600"
              />
            </div>

            {/* Destination */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
                Destination
              </label>
              <div className="relative">
                <Navigation className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="e.g. Goa, India or Paris, France"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-xs font-bold text-slate-800 placeholder-slate-400 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:placeholder-slate-600"
                />
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
                  Start Date
                </label>
                <div className="relative">
                  <Calendar className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-xs font-bold text-slate-800 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
                  End Date
                </label>
                <div className="relative">
                  <Calendar className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-xs font-bold text-slate-800 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Currency */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
                Trip Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs font-bold text-slate-800 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
              >
                {supportedCurrencies.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
                Description (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="Trip itinerary, hotel details, notes..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-medium text-slate-800 placeholder-slate-400 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:placeholder-slate-600 resize-none"
              />
            </div>

            {!isEdit && (
              <div className="p-3.5 rounded-2xl border border-indigo-500/20 bg-indigo-500/5 text-xs text-indigo-700 dark:text-indigo-300">
                <p className="font-bold flex items-center gap-1.5">
                  <Users className="h-4 w-4" /> Multi-User Collaboration Ready
                </p>
                <p className="text-[11px] mt-1 opacity-90">
                  You will start as the trip creator. You can invite other eTracker friends by their email address right after creating the trip!
                </p>
              </div>
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
                className="rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-6 py-3 text-xs font-extrabold uppercase tracking-wider text-white shadow-lg shadow-indigo-500/20 transition hover:brightness-105 disabled:opacity-50"
              >
                {submitting ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Collaborative Trip'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
