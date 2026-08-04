import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Calendar, DollarSign, Tag, Clock } from 'lucide-react'
import { useExpenseContext } from '../context/ExpenseContext.jsx'
import { v4 as uuidv4 } from 'uuid'
import toast from 'react-hot-toast'

const defaultBill = {
  name: '',
  amount: '',
  date: new Date().toISOString().slice(0, 10),
  category: 'Subscription',
  repeat: 'monthly',
  status: 'pending'
}

function AddBillModal({ open, onOpenChange, initialBill }) {
  const { addBill, updateBill, settings } = useExpenseContext()
  const [bill, setBill] = useState(initialBill ?? defaultBill)
  const isEditMode = Boolean(initialBill)
  const currency = settings?.currency || 'USD'

  useEffect(() => {
    if (open) {
      setBill(initialBill ?? defaultBill)
    }
  }, [open, initialBill])

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!bill.name || !bill.amount || !bill.date) {
      toast.error('Please fill in all required fields.')
      return
    }
    if (Number(bill.amount) <= 0) {
      toast.error('Amount must be positive.')
      return
    }

    if (isEditMode) {
      updateBill({ ...bill, amount: Number(bill.amount) })
    } else {
      addBill({ ...bill, id: uuidv4(), amount: Number(bill.amount) })
    }
    onOpenChange(false)
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => onOpenChange(false)}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            className="relative z-10 w-full max-w-md rounded-[2rem] border border-slate-200/30 bg-white/95 p-8 shadow-2xl backdrop-blur-md dark:border-white/[0.03] dark:bg-slate-955/95"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-extrabold tracking-tight text-slate-850 dark:text-white">
                  {isEditMode ? 'Edit Bill Commitment' : 'Add Bill Commitment'}
                </h2>
                <p className="mt-1 text-xs font-semibold text-slate-455 dark:text-slate-500">
                  Configure recurring payments and deadlines.
                </p>
              </div>
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100/50 text-slate-450 transition hover:bg-slate-100 hover:text-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              
              {/* Name Input with Floating Label */}
              <div className="relative">
                <input
                  type="text"
                  id="bill-name"
                  value={bill.name}
                  onChange={(event) => setBill({ ...bill, name: event.target.value })}
                  className="peer w-full rounded-2xl border border-slate-200/60 bg-slate-50/50 px-4 pt-6 pb-2 text-sm font-semibold text-slate-800 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 dark:border-white/[0.04] dark:bg-slate-900/30 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:bg-slate-950 placeholder-transparent"
                  placeholder="Name"
                  required
                />
                <label
                  htmlFor="bill-name"
                  className="absolute left-4 top-2 text-[9px] font-black uppercase tracking-wider text-slate-450 dark:text-slate-500 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-xs peer-placeholder-shown:font-semibold peer-focus:top-2 peer-focus:text-[9px] peer-focus:font-black peer-focus:text-indigo-500 pointer-events-none"
                >
                  Bill Name / Description
                </label>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                
                {/* Amount Input with Floating Label */}
                <div className="relative">
                  <input
                    type="number"
                    id="bill-amount"
                    value={bill.amount}
                    onChange={(event) => setBill({ ...bill, amount: event.target.value })}
                    min="0"
                    step="0.01"
                    className="peer w-full rounded-2xl border border-slate-200/60 bg-slate-50/50 px-4 pt-6 pb-2 text-sm font-semibold text-slate-800 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 dark:border-white/[0.04] dark:bg-slate-900/30 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:bg-slate-950 placeholder-transparent"
                    placeholder="Amount"
                    required
                  />
                  <label
                    htmlFor="bill-amount"
                    className="absolute left-4 top-2 text-[9px] font-black uppercase tracking-wider text-slate-455 dark:text-slate-500 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-xs peer-placeholder-shown:font-semibold peer-focus:top-2 peer-focus:text-[9px] peer-focus:font-black peer-focus:text-indigo-500 pointer-events-none"
                  >
                    Amount ({currency})
                  </label>
                </div>

                {/* Due Date with Floating Label */}
                <div className="relative">
                  <input
                    type="date"
                    id="bill-date"
                    value={bill.date}
                    onChange={(event) => setBill({ ...bill, date: event.target.value })}
                    className="peer w-full rounded-2xl border border-slate-200/60 bg-slate-50/50 px-4 pt-6 pb-2 text-sm font-semibold text-slate-800 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 dark:border-white/[0.04] dark:bg-slate-900/30 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:bg-slate-950 placeholder-transparent"
                    placeholder="Due Date"
                    required
                  />
                  <label
                    htmlFor="bill-date"
                    className="absolute left-4 top-2 text-[9px] font-black uppercase tracking-wider text-slate-450 dark:text-slate-500 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-xs peer-placeholder-shown:font-semibold peer-focus:top-2 peer-focus:text-[9px] peer-focus:font-black peer-focus:text-indigo-500 pointer-events-none"
                  >
                    Due Date
                  </label>
                </div>

              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                
                {/* Category Dropdown */}
                <div className="relative">
                  <select
                    id="bill-category"
                    value={bill.category}
                    onChange={(event) => setBill({ ...bill, category: event.target.value })}
                    className="peer w-full rounded-2xl border border-slate-200/60 bg-slate-50/50 px-4 pt-6 pb-2 text-sm font-semibold text-slate-850 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 dark:border-white/[0.04] dark:bg-slate-900/30 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:bg-slate-950 appearance-none"
                  >
                    <option value="Subscription">Subscription</option>
                    <option value="Utilities">Utilities</option>
                    <option value="Rent">Rent</option>
                    <option value="Insurance">Insurance</option>
                    <option value="Taxes">Taxes</option>
                    <option value="Other">Other</option>
                  </select>
                  <label
                    htmlFor="bill-category"
                    className="absolute left-4 top-2 text-[9px] font-black uppercase tracking-wider text-slate-455 dark:text-slate-500 pointer-events-none"
                  >
                    Category
                  </label>
                  <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
                    <Tag className="h-3.5 w-3.5" />
                  </div>
                </div>

                {/* Repeat Dropdown */}
                <div className="relative">
                  <select
                    id="bill-repeat"
                    value={bill.repeat}
                    onChange={(event) => setBill({ ...bill, repeat: event.target.value })}
                    className="peer w-full rounded-2xl border border-slate-200/60 bg-slate-50/50 px-4 pt-6 pb-2 text-sm font-semibold text-slate-855 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 dark:border-white/[0.04] dark:bg-slate-900/30 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:bg-slate-950 appearance-none"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                  <label
                    htmlFor="bill-repeat"
                    className="absolute left-4 top-2 text-[9px] font-black uppercase tracking-wider text-slate-455 dark:text-slate-500 pointer-events-none"
                  >
                    Repeat Schedule
                  </label>
                  <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
                    <Clock className="h-3.5 w-3.5" />
                  </div>
                </div>

              </div>

              {/* Status Dropdown */}
              <div className="relative">
                <select
                  id="bill-status"
                  value={bill.status}
                  onChange={(event) => setBill({ ...bill, status: event.target.value })}
                  className="peer w-full rounded-2xl border border-slate-200/60 bg-slate-50/50 px-4 pt-6 pb-2 text-sm font-semibold text-slate-850 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 dark:border-white/[0.04] dark:bg-slate-900/30 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:bg-slate-950 appearance-none"
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                </select>
                <label
                  htmlFor="bill-status"
                  className="absolute left-4 top-2 text-[9px] font-black uppercase tracking-wider text-slate-450 dark:text-slate-500 pointer-events-none"
                >
                  Initial Status
                </label>
              </div>

              {/* Submit / Cancel Buttons */}
              <div className="flex flex-col-reverse gap-3 pt-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  className="rounded-xl border border-slate-200/50 bg-white px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 transition hover:bg-slate-50 hover:text-slate-800 dark:border-white/[0.04] dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-gradient-to-r from-indigo-500 to-purple-655 px-5 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-indigo-500/20 transition hover:brightness-105"
                >
                  {isEditMode ? 'Save Bill' : 'Add Bill'}
                </button>
              </div>

            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default AddBillModal
