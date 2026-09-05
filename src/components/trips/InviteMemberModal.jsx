import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, UserPlus, Search, Mail, CheckCircle2, AlertCircle, Sparkles, UserCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import { useTripContext } from '../../context/TripContext.jsx'

export default function InviteMemberModal({ open, onClose, trip }) {
  const { searchUserByEmail, inviteUserToTrip } = useTripContext()

  const [emailInput, setEmailInput] = useState('')
  const [searching, setSearching] = useState(false)
  const [searchResult, setSearchResult] = useState(null)
  const [inviting, setInviting] = useState(false)
  const [searched, setSearched] = useState(false)

  const handleSearch = async (e) => {
    e?.preventDefault()
    const trimmed = emailInput.trim()
    if (!trimmed) return

    setSearching(true)
    setSearched(true)
    setSearchResult(null)

    try {
      const result = await searchUserByEmail(trimmed)
      if (result?.error) {
        toast.error(result.error)
        setSearchResult(null)
      } else {
        setSearchResult(result)
      }
    } finally {
      setSearching(false)
    }
  }

  const handleInvite = async () => {
    if (!searchResult || !trip) return

    setInviting(true)
    try {
      const ok = await inviteUserToTrip(trip, searchResult)
      if (ok) {
        setEmailInput('')
        setSearchResult(null)
        setSearched(false)
        onClose()
      }
    } finally {
      setInviting(false)
    }
  }

  const isAlreadyMember =
    searchResult &&
    ((trip?.participantIds || trip?.memberIds || []).includes(searchResult.uid))

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
          className="relative z-10 w-full max-w-md rounded-[2.5rem] border border-slate-200/40 bg-white/95 p-6 sm:p-8 shadow-2xl backdrop-blur-xl dark:border-white/[0.05] dark:bg-slate-950/95"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-200/50 dark:border-white/[0.05]">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 text-white shadow-md shadow-indigo-500/20">
                <UserPlus className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold tracking-tight text-slate-800 dark:text-white">
                  Invite Friends
                </h3>
                <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                  Search eTracker users by email to add them to {trip?.name}
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

          {/* Search Form */}
          <form onSubmit={handleSearch} className="mt-5 space-y-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
                Friend's eTracker Email *
              </label>
              <div className="relative flex items-center gap-2">
                <div className="relative flex-1">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="friend@example.com"
                    value={emailInput}
                    onChange={(e) => {
                      setEmailInput(e.target.value)
                      setSearched(false)
                      setSearchResult(null)
                    }}
                    className="w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-xs font-bold text-slate-800 placeholder-slate-400 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:placeholder-slate-600"
                  />
                </div>
                <button
                  type="submit"
                  disabled={searching || !emailInput.trim()}
                  className="inline-flex items-center gap-1 rounded-2xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-indigo-700 disabled:opacity-50"
                >
                  <Search className="h-3.5 w-3.5" />
                  <span>{searching ? 'Finding...' : 'Find'}</span>
                </button>
              </div>
            </div>

            {/* Results Section */}
            {searched && !searching && (
              <div className="pt-2">
                {searchResult ? (
                  <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      {searchResult.photoURL ? (
                        <img
                          src={searchResult.photoURL}
                          alt={searchResult.displayName}
                          className="h-11 w-11 rounded-2xl object-cover border border-indigo-500/20 shadow-sm"
                        />
                      ) : (
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-black text-sm">
                          {(searchResult.displayName || searchResult.email).charAt(0).toUpperCase()}
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-extrabold text-slate-800 dark:text-white truncate">
                          {searchResult.displayName || 'eTracker User'}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {searchResult.email}
                        </p>
                      </div>
                    </div>

                    {isAlreadyMember ? (
                      <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 p-2.5 rounded-xl">
                        <UserCheck className="h-4 w-4 shrink-0" />
                        <span>Already a member of this trip.</span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={handleInvite}
                        disabled={inviting}
                        className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 py-2.5 text-xs font-extrabold uppercase tracking-wider text-white shadow-md shadow-indigo-500/20 transition hover:brightness-105 disabled:opacity-50"
                      >
                        <UserPlus className="h-3.5 w-3.5" />
                        <span>{inviting ? 'Sending Invite...' : 'Send Trip Invite'}</span>
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2.5 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-3.5 text-xs font-bold text-amber-700 dark:text-amber-300">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>No eTracker account found with this email.</span>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="mt-6 pt-4 border-t border-slate-200/50 dark:border-white/[0.05] flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="rounded-2xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-500 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
