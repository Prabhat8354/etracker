import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  Plus,
  Calendar,
  Users,
  DollarSign,
  Receipt,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  Edit2,
  Trash2,
  ArrowRight,
  Sparkles,
  Info,
  Clock,
  Check,
  Settings as SettingsIcon,
  Crown,
  UserPlus,
  Navigation,
  LogOut,
  Tag,
  Mail
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useTripContext } from '../context/TripContext.jsx'
import { useAuthContext } from '../context/AuthContext.jsx'
import {
  calculateParticipantBalances,
  calculateSimplifiedDebts,
  calculateUserSettlementSummary,
  calculateTripTotals,
  getExpenseSharesAndParticipants,
  round2,
} from '../services/tripSettlementEngine.js'
import { formatCurrency } from '../utils/currency.js'
import AddTripExpenseModal from '../components/trips/AddTripExpenseModal.jsx'
import AddPersonalExpenseModal from '../components/trips/AddPersonalExpenseModal.jsx'
import SettleUpModal from '../components/trips/SettleUpModal.jsx'
import CreateTripModal from '../components/trips/CreateTripModal.jsx'
import InviteMemberModal from '../components/trips/InviteMemberModal.jsx'
import DeleteModal from '../components/DeleteModal.jsx'
import Loader from '../components/Loader.jsx'

export default function TripDetails() {
  const { tripId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthContext()
  const {
    trips,
    loadingTrips,
    useActiveTrip,
    deleteExpense,
    deleteSettlement,
    deleteTrip,
    leaveTrip,
  } = useTripContext()

  const { trip: activeTrip, members, expenses, settlements, loading: loadingActiveTrip } = useActiveTrip(tripId)
  const currentTrip = activeTrip || trips.find((t) => t.id === tripId)

  const isCreator = currentTrip?.createdBy === user?.uid

  // Tab State: 'shared' | 'settle' | 'personal' | 'members'
  const [activeTab, setActiveTab] = useState('shared')

  // Modals state
  const [addExpenseModalOpen, setAddExpenseModalOpen] = useState(false)
  const [addPersonalModalOpen, setAddPersonalModalOpen] = useState(false)
  const [settleModalOpen, setSettleModalOpen] = useState(false)
  const [editTripModalOpen, setEditTripModalOpen] = useState(false)
  const [inviteModalOpen, setInviteModalOpen] = useState(false)

  // Selected item for Edit / Delete / Settle
  const [selectedExpense, setSelectedExpense] = useState(null)
  const [expenseToDelete, setExpenseToDelete] = useState(null)
  const [settlementToDelete, setSettlementToDelete] = useState(null)
  const [tripToDelete, setTripToDelete] = useState(false)
  const [tripToLeave, setTripToLeave] = useState(false)
  const [prefilledSettlement, setPrefilledSettlement] = useState(null)

  // Current user's member record
  const meMember = useMemo(
    () => members.find((m) => m.uid === user?.uid) || { id: user?.uid, name: user?.displayName || 'Me', isCurrentUser: true },
    [members, user]
  )

  // Balances calculation
  const participantBalances = useMemo(() => {
    return calculateParticipantBalances(members, expenses, settlements)
  }, [members, expenses, settlements])

  // Simplified Debts ("Who Owes Whom")
  const simplifiedDebts = useMemo(() => {
    return calculateSimplifiedDebts(participantBalances)
  }, [participantBalances])

  // User Settle-Up Summary ("How Much Should I Pay / Receive?")
  const userSettlementSummary = useMemo(() => {
    return calculateUserSettlementSummary(simplifiedDebts, user?.uid)
  }, [simplifiedDebts, user])

  // Overall Trip Totals
  const tripTotals = useMemo(() => {
    return calculateTripTotals(expenses, user?.uid)
  }, [expenses, user])

  // Current user net balance record
  const myBalanceRecord = useMemo(
    () => participantBalances.find((b) => b.id === user?.uid),
    [participantBalances, user]
  )

  // Filtered expenses
  const sharedExpenses = useMemo(() => expenses.filter((e) => !e.isPersonal), [expenses])
  const personalExpenses = useMemo(() => expenses.filter((e) => e.isPersonal), [expenses])

  if (loadingTrips || loadingActiveTrip) {
    return <Loader />
  }

  if (!currentTrip) {
    return (
      <div className="py-12 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">Trip not found</h2>
        <p className="text-xs text-slate-400">This trip may have been deleted or you may not be a member.</p>
        <button
          type="button"
          onClick={() => navigate('/trips')}
          className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-indigo-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Trips
        </button>
      </div>
    )
  }

  const currency = currentTrip.currency || 'INR'

  // Permission check helper for modifying an expense
  const canModifyExpense = (exp) => {
    if (!user) return false
    return isCreator || exp.createdBy === user.uid || exp.paidBy === user.uid
  }

  // Handle Quick Settle
  const handleOpenSettleWithDebt = (debt) => {
    setPrefilledSettlement({
      from: debt.from,
      to: debt.to,
      amount: debt.amount,
      notes: `Settling debt from ${debt.fromName} to ${debt.toName}`,
    })
    setSettleModalOpen(true)
  }

  const handleDeleteTripConfirm = async () => {
    await deleteTrip(tripId)
    setTripToDelete(false)
    navigate('/trips')
  }

  const handleLeaveTripConfirm = async () => {
    await leaveTrip(tripId)
    setTripToLeave(false)
    navigate('/trips')
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Bar: Back & Header */}
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => navigate('/trips')}
          className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>All Trips</span>
        </button>

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                {currency}
              </span>
              {currentTrip.destination && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-900 px-2.5 py-0.5 rounded-lg">
                  <Navigation className="h-3 w-3 text-indigo-500" />
                  {currentTrip.destination}
                </span>
              )}
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                <Calendar className="h-3.5 w-3.5" />
                {currentTrip.startDate} — {currentTrip.endDate}
              </span>
              {isCreator ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 text-[9px] font-black uppercase text-amber-600 dark:text-amber-400">
                  <Crown className="h-3 w-3" />
                  Trip Creator
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-900 text-[9px] font-bold text-slate-500">
                  Created by {currentTrip.createdByName || 'Admin'}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {currentTrip.name}
            </h1>
            {currentTrip.description && (
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-2xl">
                {currentTrip.description}
              </p>
            )}

            {/* Member Avatars Stack */}
            <div className="mt-3 flex items-center gap-2">
              <div className="flex -space-x-2 overflow-hidden">
                {members.slice(0, 5).map((m) => (
                  <div
                    key={m.id}
                    title={`${m.name} (${m.email || ''})`}
                    className="inline-block h-7 w-7 rounded-full ring-2 ring-white dark:ring-slate-900 bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-[10px] font-black"
                  >
                    {m.photoURL ? (
                      <img src={m.photoURL} alt={m.name} className="h-full w-full rounded-full object-cover" />
                    ) : (
                      m.name.charAt(0).toUpperCase()
                    )}
                  </div>
                ))}
              </div>
              <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500">
                {members.length} member{members.length > 1 ? 's' : ''} collaborating
              </span>
            </div>
          </div>

          {/* Top Quick Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                setSelectedExpense(null)
                setAddExpenseModalOpen(true)
              }}
              className="inline-flex items-center gap-1.5 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-4 py-2.5 text-xs font-extrabold uppercase tracking-wider text-white shadow-lg shadow-indigo-500/20 transition hover:brightness-105 active:scale-95"
            >
              <Plus className="h-4 w-4" />
              <span>Add Expense</span>
            </button>

            <button
              type="button"
              onClick={() => setInviteModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-2xl border border-indigo-500/20 bg-indigo-500/10 px-4 py-2.5 text-xs font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 transition hover:bg-indigo-500/20"
            >
              <UserPlus className="h-4 w-4" />
              <span>Invite Friends</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedExpense(null)
                setAddPersonalModalOpen(true)
              }}
              className="inline-flex items-center gap-1.5 rounded-2xl border border-purple-500/20 bg-purple-500/10 px-3.5 py-2.5 text-xs font-extrabold uppercase tracking-wider text-purple-600 dark:text-purple-400 transition hover:bg-purple-500/20"
            >
              <UserCheck className="h-4 w-4" />
              <span>Personal</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setPrefilledSettlement(null)
                setSettleModalOpen(true)
              }}
              className="inline-flex items-center gap-1.5 rounded-2xl border border-teal-500/20 bg-teal-500/10 px-3.5 py-2.5 text-xs font-extrabold uppercase tracking-wider text-teal-600 dark:text-teal-400 transition hover:bg-teal-500/20"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Settle Up</span>
            </button>

            {isCreator ? (
              <button
                type="button"
                onClick={() => setEditTripModalOpen(true)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800"
                title="Edit Trip Details"
              >
                <SettingsIcon className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setTripToLeave(true)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 text-rose-500 transition hover:bg-rose-100 dark:border-rose-900/30 dark:bg-rose-950/30 dark:text-rose-400"
                title="Leave Trip"
              >
                <LogOut className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 4 Premium Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Group Spend */}
        <div className="rounded-3xl border border-slate-200/40 bg-white/70 p-5 shadow-soft backdrop-blur-md dark:border-white/[0.04] dark:bg-slate-950/50">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Total Group Spend
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-500">
              <Receipt className="h-4.5 w-4.5" />
            </div>
          </div>
          <h3 className="mt-2 text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {formatCurrency(tripTotals.totalShared, currency)}
          </h3>
          <p className="mt-1 text-[11px] font-semibold text-slate-400 dark:text-slate-500">
            Across {sharedExpenses.length} shared expense(s)
          </p>
        </div>

        {/* You Paid */}
        <div className="rounded-3xl border border-slate-200/40 bg-white/70 p-5 shadow-soft backdrop-blur-md dark:border-white/[0.04] dark:bg-slate-950/50">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              You Paid (Group)
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
              <DollarSign className="h-4.5 w-4.5" />
            </div>
          </div>
          <h3 className="mt-2 text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {formatCurrency(myBalanceRecord?.totalPaid || 0, currency)}
          </h3>
          <p className="mt-1 text-[11px] font-semibold text-slate-400 dark:text-slate-500">
            Total out of pocket for group
          </p>
        </div>

        {/* Your Share */}
        <div className="rounded-3xl border border-slate-200/40 bg-white/70 p-5 shadow-soft backdrop-blur-md dark:border-white/[0.04] dark:bg-slate-950/50">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Your Share
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-500">
              <Users className="h-4.5 w-4.5" />
            </div>
          </div>
          <h3 className="mt-2 text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {formatCurrency(myBalanceRecord?.totalShare || 0, currency)}
          </h3>
          <p className="mt-1 text-[11px] font-semibold text-slate-400 dark:text-slate-500">
            Your portion of shared costs
          </p>
        </div>

        {/* Your Net Balance */}
        <div className="rounded-3xl border border-slate-200/40 bg-white/70 p-5 shadow-soft backdrop-blur-md dark:border-white/[0.04] dark:bg-slate-950/50">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Your Net Balance
            </span>
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                (myBalanceRecord?.netBalance || 0) > 0.01
                  ? 'bg-emerald-500/10 text-emerald-500'
                  : (myBalanceRecord?.netBalance || 0) < -0.01
                  ? 'bg-rose-500/10 text-rose-500'
                  : 'bg-slate-500/10 text-slate-500'
              }`}
            >
              <Sparkles className="h-4.5 w-4.5" />
            </div>
          </div>
          <h3
            className={`mt-2 text-xl sm:text-2xl font-black ${
              (myBalanceRecord?.netBalance || 0) > 0.01
                ? 'text-emerald-500'
                : (myBalanceRecord?.netBalance || 0) < -0.01
                ? 'text-rose-500'
                : 'text-slate-800 dark:text-white'
            }`}
          >
            {(myBalanceRecord?.netBalance || 0) > 0.01 ? '+' : ''}
            {formatCurrency(Math.abs(myBalanceRecord?.netBalance || 0) < 0.01 ? 0 : myBalanceRecord?.netBalance, currency)}
          </h3>
          <p className="mt-1 text-[11px] font-semibold text-slate-400 dark:text-slate-500">
            {(myBalanceRecord?.netBalance || 0) > 0.01
              ? 'You should receive money'
              : (myBalanceRecord?.netBalance || 0) < -0.01
              ? 'You owe group money'
              : "You're all settled"}
          </p>
        </div>
      </div>

      {/* Settle Up Action Banner: "How Much Should I Pay?" */}
      <div className="rounded-3xl border border-indigo-500/20 bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-teal-500/10 p-5 sm:p-6 backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-indigo-500" />
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">
                Settle Up Status
              </h3>
            </div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {userSettlementSummary.isSettled ? (
                "You're all settled. Everything is balanced! ✓"
              ) : userSettlementSummary.totalOwed > 0 ? (
                <span>
                  You owe a total of{' '}
                  <strong className="text-rose-500">
                    {formatCurrency(userSettlementSummary.totalOwed, currency)}
                  </strong>{' '}
                  to {userSettlementSummary.debtsToPay.length} friend(s).
                </span>
              ) : (
                <span>
                  Friends owe you a total of{' '}
                  <strong className="text-emerald-500">
                    {formatCurrency(userSettlementSummary.totalToReceive, currency)}
                  </strong>
                  .
                </span>
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {!userSettlementSummary.isSettled && userSettlementSummary.debtsToPay.map((debt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleOpenSettleWithDebt(debt)}
                className="inline-flex items-center gap-2 rounded-2xl bg-rose-500 px-4 py-2 text-xs font-extrabold uppercase tracking-wider text-white shadow-md shadow-rose-500/20 transition hover:bg-rose-600 active:scale-95"
              >
                <span>Pay {debt.toName} {formatCurrency(debt.amount, currency)}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            ))}

            {!userSettlementSummary.isSettled && userSettlementSummary.debtsToReceive.map((debt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleOpenSettleWithDebt(debt)}
                className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-4 py-2 text-xs font-extrabold uppercase tracking-wider text-white shadow-md shadow-emerald-500/20 transition hover:bg-emerald-600 active:scale-95"
              >
                <span>{debt.fromName} pays you {formatCurrency(debt.amount, currency)}</span>
                <Check className="h-3.5 w-3.5" />
              </button>
            ))}

            <button
              type="button"
              onClick={() => {
                setPrefilledSettlement(null)
                setSettleModalOpen(true)
              }}
              className="inline-flex items-center gap-1.5 rounded-2xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 transition"
            >
              <span>Record Custom Payment</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200/50 dark:border-white/[0.05] overflow-x-auto no-scrollbar gap-1 sm:gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('shared')}
          className={`relative pb-3 px-4 text-xs font-extrabold uppercase tracking-wider transition ${
            activeTab === 'shared'
              ? 'text-indigo-600 dark:text-indigo-400'
              : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          Shared Expenses ({sharedExpenses.length})
          {activeTab === 'shared' && (
            <motion.div
              layoutId="tab-underline"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500"
            />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('settle')}
          className={`relative pb-3 px-4 text-xs font-extrabold uppercase tracking-wider transition ${
            activeTab === 'settle'
              ? 'text-indigo-600 dark:text-indigo-400'
              : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          Settle Up & Balances
          {activeTab === 'settle' && (
            <motion.div
              layoutId="tab-underline"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500"
            />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('personal')}
          className={`relative pb-3 px-4 text-xs font-extrabold uppercase tracking-wider transition ${
            activeTab === 'personal'
              ? 'text-indigo-600 dark:text-indigo-400'
              : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          Personal Expenses ({personalExpenses.length})
          {activeTab === 'personal' && (
            <motion.div
              layoutId="tab-underline"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500"
            />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('members')}
          className={`relative pb-3 px-4 text-xs font-extrabold uppercase tracking-wider transition ${
            activeTab === 'members'
              ? 'text-indigo-600 dark:text-indigo-400'
              : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          Members ({members.length})
          {activeTab === 'members' && (
            <motion.div
              layoutId="tab-underline"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500"
            />
          )}
        </button>
      </div>

      {/* Tab 1: Shared Expenses */}
      {activeTab === 'shared' && (
        <div className="space-y-4">
          {sharedExpenses.length === 0 ? (
            <div className="rounded-3xl border border-slate-200/40 bg-white/60 p-10 text-center shadow-soft backdrop-blur-md dark:border-white/[0.03] dark:bg-slate-950/40 space-y-4 max-w-lg mx-auto">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500">
                <Receipt className="h-8 w-8" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-800 dark:text-white">
                  Add your first shared expense
                </h3>
                <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                  Collaborate in real-time. Any member can add an expense to split costs.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedExpense(null)
                  setAddExpenseModalOpen(true)
                }}
                className="inline-flex items-center gap-1.5 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 px-5 py-2.5 text-xs font-extrabold uppercase tracking-wider text-white shadow-md shadow-indigo-500/20 transition hover:brightness-105"
              >
                <Plus className="h-4 w-4" />
                <span>Add Expense</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {sharedExpenses.map((exp) => {
                const payer = members.find((m) => m.id === exp.paidBy)
                const canModify = canModifyExpense(exp)

                return (
                  <div
                    key={exp.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 rounded-3xl border border-slate-200/40 bg-white/70 shadow-soft backdrop-blur-md dark:border-white/[0.04] dark:bg-slate-950/50 gap-4"
                  >
                    <div className="flex items-start gap-3.5 min-w-0">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500 font-extrabold">
                        {payer?.photoURL ? (
                          <img src={payer.photoURL} alt={payer.name} className="h-full w-full rounded-2xl object-cover" />
                        ) : (
                          <Receipt className="h-5 w-5" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-sm font-extrabold text-slate-800 dark:text-white truncate">
                            {exp.description}
                          </h4>
                          {exp.category && (
                            <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-[9px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                              {exp.category}
                            </span>
                          )}
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-900 text-[9px] font-black uppercase tracking-wider text-slate-500">
                            {exp.splitType} split
                          </span>
                        </div>

                        <p className="mt-1 text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                          Paid by <strong className="text-slate-700 dark:text-slate-300">{exp.paidByName || payer?.name || 'Member'}</strong> • {exp.date}
                        </p>

                        {/* Sharing Members tags */}
                        <div className="mt-2 flex flex-wrap items-center gap-1">
                          <span className="text-[10px] text-slate-400 mr-1">Shared by:</span>
                          {(() => {
                            const { participantIds, sharesMap } = getExpenseSharesAndParticipants(exp)
                            return participantIds.map((pId) => {
                              const p = members.find((part) => part.id === pId)
                              const share = sharesMap[pId]
                              return (
                                <span
                                  key={pId}
                                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2 py-0.5 text-[9px] font-bold text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400"
                                >
                                  {p?.name || 'Member'} {p?.isCurrentUser ? '(Me)' : ''}
                                  {share !== undefined && (
                                    <span className="text-indigo-500 font-extrabold">
                                      ({formatCurrency(share, exp.currency || currency)})
                                    </span>
                                  )}
                                </span>
                              )
                            })
                          })()}
                        </div>

                        {exp.notes && (
                          <p className="mt-1.5 text-[10px] text-slate-400 italic">
                            "{exp.notes}"
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Amount & Actions */}
                    <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-white/[0.04]">
                      <div className="sm:text-right">
                        <span className="text-base font-black text-slate-900 dark:text-white block">
                          {formatCurrency(exp.amount, exp.currency || currency)}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Original: {exp.currency || currency}
                        </span>
                      </div>

                      {canModify && (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedExpense(exp)
                              setAddExpenseModalOpen(true)
                            }}
                            className="p-2 text-slate-400 hover:text-indigo-500 transition rounded-xl hover:bg-indigo-500/10"
                            title="Edit expense"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setExpenseToDelete(exp)}
                            className="p-2 text-slate-400 hover:text-rose-500 transition rounded-xl hover:bg-rose-500/10"
                            title="Delete expense"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Settle Up & Balances */}
      {activeTab === 'settle' && (
        <div className="space-y-6">
          {/* Section 1: Who Owes Whom (Minimized Transactions) */}
          <div className="rounded-3xl border border-slate-200/40 bg-white/70 p-6 shadow-soft backdrop-blur-md dark:border-white/[0.04] dark:bg-slate-950/50 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Who Owes Whom
                </h3>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  Minimal transactions calculated to settle all group debts cleanly
                </p>
              </div>
              <span className="px-3 py-1 rounded-xl bg-indigo-500/10 text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                {simplifiedDebts.length} transfer(s) needed
              </span>
            </div>

            {simplifiedDebts.filter((d) => d.amount > 0.01).length === 0 ? (
              <div className="py-6 text-center text-xs font-semibold text-emerald-500 flex items-center justify-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                <span>Everyone is completely settled up! No transfers needed.</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {simplifiedDebts
                  .filter((debt) => debt.amount > 0.01)
                  .map((debt, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-4 rounded-2xl border border-slate-200/50 bg-slate-50/50 dark:border-white/[0.03] dark:bg-slate-900/30 gap-3"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-xs font-bold text-slate-800 dark:text-white truncate">
                        {debt.fromName}
                      </span>
                      <ArrowRight className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span className="text-xs font-bold text-slate-800 dark:text-white truncate">
                        {debt.toName}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-sm font-black text-slate-900 dark:text-white">
                        {formatCurrency(debt.amount, currency)}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleOpenSettleWithDebt(debt)}
                        className="rounded-xl bg-teal-500 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-white shadow-sm hover:bg-teal-600 transition"
                      >
                        Mark as Paid
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 2: Member Balances Breakdown Table */}
          <div className="rounded-3xl border border-slate-200/40 bg-white/70 p-6 shadow-soft backdrop-blur-md dark:border-white/[0.04] dark:bg-slate-950/50 space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Member Balances Summary
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200/50 dark:border-white/[0.05] text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="pb-3">Member</th>
                    <th className="pb-3">Total Paid</th>
                    <th className="pb-3">Total Share</th>
                    <th className="pb-3">Settlements (+Paid / -Recv)</th>
                    <th className="pb-3 text-right">Net Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/[0.03]">
                  {participantBalances.map((b) => (
                    <tr key={b.id} className="font-semibold text-slate-700 dark:text-slate-300">
                      <td className="py-3 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        {b.name}
                        {b.isCurrentUser && (
                          <span className="px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase bg-indigo-500/10 text-indigo-500">
                            Me
                          </span>
                        )}
                      </td>
                      <td className="py-3">{formatCurrency(b.totalPaid, currency)}</td>
                      <td className="py-3">{formatCurrency(b.totalShare, currency)}</td>
                      <td className="py-3">
                        <span className="text-emerald-500">+{formatCurrency(b.settlementsPaid, currency)}</span> /{' '}
                        <span className="text-rose-500">-{formatCurrency(b.settlementsReceived, currency)}</span>
                      </td>
                      <td className="py-3 text-right">
                        <span
                          className={`font-black ${
                            b.netBalance > 0.01
                              ? 'text-emerald-500'
                              : b.netBalance < -0.01
                              ? 'text-rose-500'
                              : 'text-slate-400'
                          }`}
                        >
                          {b.netBalance > 0.01 ? '+' : ''}
                          {formatCurrency(Math.abs(b.netBalance || 0) < 0.01 ? 0 : b.netBalance, currency)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 3: Settlement History */}
          <div className="rounded-3xl border border-slate-200/40 bg-white/70 p-6 shadow-soft backdrop-blur-md dark:border-white/[0.04] dark:bg-slate-950/50 space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Recorded Settlements ({settlements.length})
            </h3>

            {settlements.length === 0 ? (
              <p className="text-xs text-slate-400 py-2">
                No settlements recorded yet. When members pay back their shares, record it here to update balances.
              </p>
            ) : (
              <div className="space-y-2.5">
                {settlements.map((st) => (
                  <div
                    key={st.id}
                    className="flex items-center justify-between p-3.5 rounded-2xl border border-teal-500/20 bg-teal-500/5 dark:border-teal-500/10 dark:bg-teal-500/5 gap-3"
                  >
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="h-4 w-4 text-teal-500 shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-slate-800 dark:text-white">
                          <strong>{st.fromName || 'Member'}</strong> paid{' '}
                          <strong>{st.toName || 'Member'}</strong>{' '}
                          <span className="text-teal-600 dark:text-teal-400 font-extrabold">
                            {formatCurrency(st.amount, st.currency || currency)}
                          </span>
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          Settled on {st.date} {st.notes ? `• "${st.notes}"` : ''}
                        </p>
                      </div>
                    </div>

                    {(isCreator || st.createdBy === user?.uid) && (
                      <button
                        type="button"
                        onClick={() => setSettlementToDelete(st)}
                        className="p-1.5 text-slate-400 hover:text-rose-500 transition rounded-lg hover:bg-rose-500/10"
                        title="Delete settlement"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Personal Expenses */}
      {activeTab === 'personal' && (
        <div className="space-y-4">
          <div className="flex items-start gap-2.5 rounded-2xl border border-purple-500/20 bg-purple-500/5 p-4 text-xs text-purple-700 dark:text-purple-300">
            <Info className="h-4 w-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Personal Trip Expenses</p>
              <p className="mt-0.5 text-[11px] opacity-90">
                Expenses logged here are strictly for your individual tracking and do <strong>NOT</strong> modify group debt or who owes whom.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">
              Total Personal Spend: {formatCurrency(tripTotals.currentUserPersonal, currency)}
            </h3>
            <button
              type="button"
              onClick={() => {
                setSelectedExpense(null)
                setAddPersonalModalOpen(true)
              }}
              className="inline-flex items-center gap-1.5 rounded-2xl bg-purple-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-purple-700 transition"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Personal Expense</span>
            </button>
          </div>

          {personalExpenses.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No personal expenses logged yet for this trip.
            </div>
          ) : (
            <div className="space-y-2.5">
              {personalExpenses.map((exp) => (
                <div
                  key={exp.id}
                  className="flex items-center justify-between p-4 rounded-2xl border border-slate-200/50 bg-white/70 dark:border-white/[0.04] dark:bg-slate-950/50 gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-500">
                      <UserCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-white">{exp.description}</h4>
                      <p className="text-[10px] text-slate-400">{exp.date} {exp.notes ? `• ${exp.notes}` : ''}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-sm font-black text-slate-900 dark:text-white">
                      {formatCurrency(exp.amount, exp.currency || currency)}
                    </span>
                    {canModifyExpense(exp) && (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedExpense(exp)
                            setAddPersonalModalOpen(true)
                          }}
                          className="p-1.5 text-slate-400 hover:text-purple-500 transition rounded-lg hover:bg-purple-500/10"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setExpenseToDelete(exp)}
                          className="p-1.5 text-slate-400 hover:text-rose-500 transition rounded-lg hover:bg-rose-500/10"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Members & Invites */}
      {activeTab === 'members' && (
        <div className="rounded-3xl border border-slate-200/40 bg-white/70 p-6 shadow-soft backdrop-blur-md dark:border-white/[0.04] dark:bg-slate-950/50 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Collaborative Trip Members ({members.length})
              </h3>
              <p className="text-xs text-slate-400">
                All members can add expenses and view real-time settlement balances
              </p>
            </div>

            <button
              type="button"
              onClick={() => setInviteModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-2xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-indigo-700 transition"
            >
              <UserPlus className="h-3.5 w-3.5" />
              <span>Invite Friends by Email</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {members.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200/50 bg-slate-50/50 dark:border-white/[0.03] dark:bg-slate-900/30"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {m.photoURL ? (
                    <img src={m.photoURL} alt={m.name} className="h-10 w-10 rounded-2xl object-cover shrink-0" />
                  ) : (
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500 font-extrabold text-xs">
                      {m.name.charAt(0).toUpperCase()}
                    </div>
                  )}

                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 dark:text-white truncate">
                      {m.name} {m.isCurrentUser ? '(You)' : ''}
                    </p>
                    {m.email && (
                      <p className="text-[10px] text-slate-400 truncate">
                        {m.email}
                      </p>
                    )}
                    <span
                      className={`inline-block mt-0.5 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                        m.role === 'creator'
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                          : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                      }`}
                    >
                      {m.role === 'creator' ? 'Creator' : 'Member'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      <AddTripExpenseModal
        open={addExpenseModalOpen}
        onClose={() => {
          setAddExpenseModalOpen(false)
          setSelectedExpense(null)
        }}
        trip={currentTrip}
        participants={members}
        initialExpense={selectedExpense}
      />

      <AddPersonalExpenseModal
        open={addPersonalModalOpen}
        onClose={() => {
          setAddPersonalModalOpen(false)
          setSelectedExpense(null)
        }}
        trip={currentTrip}
        participants={members}
        initialExpense={selectedExpense}
      />

      <SettleUpModal
        open={settleModalOpen}
        onClose={() => {
          setSettleModalOpen(false)
          setPrefilledSettlement(null)
        }}
        trip={currentTrip}
        participants={members}
        balances={participantBalances}
        simplifiedDebts={simplifiedDebts}
        initialSettlement={prefilledSettlement}
      />

      <InviteMemberModal
        open={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        trip={currentTrip}
      />

      <CreateTripModal
        open={editTripModalOpen}
        onClose={() => setEditTripModalOpen(false)}
        initialTrip={currentTrip}
      />

      {/* Delete Expense Modal */}
      {expenseToDelete && (
        <DeleteModal
          title={`Delete "${expenseToDelete.description}"?`}
          message="Are you sure you want to delete this expense? All split allocations and group debt balances will be recalculated automatically for all members."
          onConfirm={async () => {
            await deleteExpense(tripId, expenseToDelete.id, expenseToDelete)
            setExpenseToDelete(null)
          }}
          onCancel={() => setExpenseToDelete(null)}
        />
      )}

      {/* Delete Settlement Modal */}
      {settlementToDelete && (
        <DeleteModal
          title="Delete Settlement Record?"
          message="Are you sure you want to remove this settlement record? The debt will be marked as unpaid and balances will be recalculated."
          onConfirm={async () => {
            await deleteSettlement(tripId, settlementToDelete.id)
            setSettlementToDelete(null)
          }}
          onCancel={() => setSettlementToDelete(null)}
        />
      )}

      {/* Delete Trip Modal (Creator) */}
      {tripToDelete && (
        <DeleteModal
          title={`Delete "${currentTrip.name}"?`}
          message="Are you sure you want to delete this entire trip? All members will lose access and all expenses will be permanently deleted."
          onConfirm={handleDeleteTripConfirm}
          onCancel={() => setTripToDelete(false)}
        />
      )}

      {/* Leave Trip Modal (Member) */}
      {tripToLeave && (
        <DeleteModal
          title={`Leave "${currentTrip.name}"?`}
          message="Are you sure you want to leave this trip? You will no longer have access to its expenses or settlements unless re-invited."
          onConfirm={handleLeaveTripConfirm}
          onCancel={() => setTripToLeave(false)}
        />
      )}
    </div>
  )
}
