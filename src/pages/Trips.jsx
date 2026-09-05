import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plane,
  Plus,
  Calendar,
  Users,
  DollarSign,
  ArrowRight,
  Trash2,
  MapPin,
  Sparkles,
  Luggage,
  Clock,
  Mail,
  Check,
  X,
  LogOut,
  Crown
} from 'lucide-react'
import { useTripContext } from '../context/TripContext.jsx'
import { useAuthContext } from '../context/AuthContext.jsx'
import CreateTripModal from '../components/trips/CreateTripModal.jsx'
import DeleteModal from '../components/DeleteModal.jsx'
import Loader from '../components/Loader.jsx'

export default function Trips() {
  const navigate = useNavigate()
  const { user } = useAuthContext()
  const {
    trips,
    loadingTrips,
    invitations,
    loadingInvitations,
    acceptInvitation,
    declineInvitation,
    deleteTrip,
    leaveTrip,
  } = useTripContext()

  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [tripToDelete, setTripToDelete] = useState(null)
  const [tripToLeave, setTripToLeave] = useState(null)
  const [processingInvId, setProcessingInvId] = useState(null)

  const handleDeleteConfirm = async () => {
    if (!tripToDelete) return
    await deleteTrip(tripToDelete.id)
    setTripToDelete(null)
  }

  const handleLeaveConfirm = async () => {
    if (!tripToLeave) return
    await leaveTrip(tripToLeave.id)
    setTripToLeave(null)
  }

  const handleAccept = async (inv) => {
    setProcessingInvId(inv.id)
    try {
      await acceptInvitation(inv)
    } finally {
      setProcessingInvId(null)
    }
  }

  const handleDecline = async (invId) => {
    setProcessingInvId(invId)
    try {
      await declineInvitation(invId)
    } finally {
      setProcessingInvId(null)
    }
  }

  if (loadingTrips || loadingInvitations) {
    return <Loader />
  }

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold mb-2">
            <Plane className="h-3.5 w-3.5" />
            <span>Trip Split</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Shared Trip Expenses
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-slate-400 dark:text-slate-500 mt-1">
            Collaborate on group vacations in real-time, split expenses equally or custom, and settle debts cleanly.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setCreateModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-5 py-3 text-xs font-extrabold uppercase tracking-wider text-white shadow-lg shadow-indigo-500/20 transition hover:brightness-105 active:scale-95"
        >
          <Plus className="h-4 w-4" />
          <span>Create Trip</span>
        </button>
      </div>

      {/* Pending Invitations Banner */}
      {invitations.length > 0 && (
        <div className="rounded-3xl border border-indigo-500/30 bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-teal-500/10 p-5 sm:p-6 backdrop-blur-md space-y-3">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
            <Mail className="h-5 w-5" />
            <h3 className="text-sm font-extrabold uppercase tracking-wider">
              Pending Trip Invitations ({invitations.length})
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {invitations.map((inv) => (
              <div
                key={inv.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border border-indigo-500/20 bg-white/80 dark:bg-slate-950/80 shadow-soft gap-3"
              >
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">{inv.tripName}</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Invited by <strong>{inv.invitedByName}</strong> ({inv.invitedByEmail})
                  </p>
                  {inv.destination && (
                    <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3 text-indigo-500" />
                      {inv.destination}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    disabled={processingInvId === inv.id}
                    onClick={() => handleAccept(inv)}
                    className="inline-flex items-center gap-1 rounded-xl bg-emerald-500 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-600 transition disabled:opacity-50"
                  >
                    <Check className="h-3.5 w-3.5" />
                    <span>Join</span>
                  </button>
                  <button
                    type="button"
                    disabled={processingInvId === inv.id}
                    onClick={() => handleDecline(inv.id)}
                    className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 transition disabled:opacity-50"
                  >
                    <X className="h-3.5 w-3.5" />
                    <span>Decline</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Trips Grid / Empty State */}
      {trips.length === 0 ? (
        <div className="rounded-[2.5rem] border border-slate-200/40 bg-white/60 p-10 sm:p-14 text-center shadow-soft backdrop-blur-md dark:border-white/[0.03] dark:bg-slate-950/40 space-y-5 max-w-2xl mx-auto">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-indigo-500/10 text-indigo-500 shadow-inner">
            <Luggage className="h-10 w-10 animate-bounce" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-extrabold tracking-tight text-slate-800 dark:text-white">
              Plan your first trip
            </h2>
            <p className="text-xs sm:text-sm font-semibold text-slate-400 dark:text-slate-500 max-w-md mx-auto">
              Track shared expenses, split payments and settle up without the awkward math.
            </p>
          </div>
          <div>
            <button
              type="button"
              onClick={() => setCreateModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-3.5 text-xs font-extrabold uppercase tracking-wider text-white shadow-lg shadow-indigo-500/25 transition hover:brightness-105"
            >
              <Plus className="h-4 w-4" />
              <span>Create Trip</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {trips.map((trip) => {
            const isCreator = trip.createdBy === user?.uid
            const memberCount = trip.participantIds?.length || trip.memberIds?.length || 1

            return (
              <motion.div
                key={trip.id}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                className="group relative flex flex-col justify-between rounded-3xl border border-slate-200/40 bg-white/70 p-6 shadow-soft backdrop-blur-md dark:border-white/[0.04] dark:bg-slate-950/50 hover:shadow-lg transition cursor-pointer"
                onClick={() => navigate(`/trips/${trip.id}`)}
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 text-white shadow-md shadow-indigo-500/20">
                        <MapPin className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-extrabold tracking-tight text-slate-800 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition truncate max-w-[170px]">
                            {trip.name}
                          </h3>
                          {isCreator && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400" title="Trip Creator">
                              <Crown className="h-2.5 w-2.5" />
                              Creator
                            </span>
                          )}
                        </div>

                        {trip.destination && (
                          <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 truncate">
                            {trip.destination}
                          </p>
                        )}

                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <Clock className="h-3 w-3" />
                          {trip.startDate} — {trip.endDate}
                        </p>
                      </div>
                    </div>

                    {isCreator ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setTripToDelete(trip)
                        }}
                        className="p-2 text-slate-300 hover:text-rose-500 transition rounded-xl hover:bg-rose-500/10 dark:text-slate-600 dark:hover:text-rose-400"
                        title="Delete trip"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setTripToLeave(trip)
                        }}
                        className="p-2 text-slate-300 hover:text-rose-500 transition rounded-xl hover:bg-rose-500/10 dark:text-slate-600 dark:hover:text-rose-400"
                        title="Leave trip"
                      >
                        <LogOut className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  {/* Description */}
                  {trip.description && (
                    <p className="mt-3 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                      {trip.description}
                    </p>
                  )}
                </div>

                {/* Card Footer */}
                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/[0.04] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-900 text-[10px] font-extrabold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                      <DollarSign className="h-3 w-3 text-indigo-500" />
                      {trip.currency || 'INR'}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-indigo-500/10 text-[10px] font-extrabold text-indigo-600 dark:text-indigo-400">
                      <Users className="h-3 w-3" />
                      {memberCount} member{memberCount > 1 ? 's' : ''}
                    </span>
                  </div>

                  <span className="inline-flex items-center gap-1 text-xs font-extrabold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-1 transition">
                    Open
                    <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Create Trip Modal */}
      <CreateTripModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
      />

      {/* Delete Confirmation Modal (creator only) */}
      {tripToDelete && (
        <DeleteModal
          title={`Delete "${tripToDelete.name}"?`}
          message="Are you sure you want to delete this collaborative trip? All recorded expenses, member records, and settlements will be permanently removed for all members."
          onConfirm={handleDeleteConfirm}
          onCancel={() => setTripToDelete(null)}
        />
      )}

      {/* Leave Trip Modal (member only) */}
      {tripToLeave && (
        <DeleteModal
          title={`Leave "${tripToLeave.name}"?`}
          message="Are you sure you want to leave this trip? You will no longer have access to its expenses or settlement records unless re-invited."
          onConfirm={handleLeaveConfirm}
          onCancel={() => setTripToLeave(null)}
        />
      )}
    </div>
  )
}
