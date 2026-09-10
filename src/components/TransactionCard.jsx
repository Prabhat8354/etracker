import { useState } from 'react'
import {
  Edit2,
  Trash2,
  DollarSign,
  Briefcase,
  TrendingUp,
  ShoppingCart,
  Zap,
  HeartPulse,
  Plane,
  Tv,
  ShoppingBag,
  Tag
} from 'lucide-react'
import { formatCurrency, formatDate, getCategoryColor } from '../utils/helpers.jsx'
import { DEFAULT_CURRENCY, canConvert } from '../utils/currency.js'
import { useExpenseContext } from '../context/ExpenseContext.jsx'
import DeleteModal from './DeleteModal.jsx'
import TransactionModal from './AddTransactionModal.jsx'

const categoryIcons = {
  Salary: DollarSign,
  Freelance: Briefcase,
  Investments: TrendingUp,
  Groceries: ShoppingCart,
  Utilities: Zap,
  Health: HeartPulse,
  Travel: Plane,
  Entertainment: Tv,
  Shopping: ShoppingBag,
}

function TransactionCard({ transaction, compact }) {
  const { deleteTransaction, settings, convertCurrency, rates } = useExpenseContext()
  const [showDelete, setShowDelete] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  
  const currency = settings?.currency || DEFAULT_CURRENCY
  const txCurrency = transaction.currency || DEFAULT_CURRENCY
  const IconComponent = categoryIcons[transaction.category] || Tag

  return (
    <>
      <div
        className={`glass-card rounded-3xl p-5 transition duration-300 ${
          compact ? 'grid grid-cols-[auto_1fr] gap-4 items-center' : 'flex flex-col gap-4'
        }`}
      >
        {/* Left: Category Icon */}
        <div className={`inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${getCategoryColor(transaction.category)} text-white shadow-lg`}>
          <IconComponent className="h-6 w-6" />
        </div>

        {/* Center/Right Content */}
        <div className="flex-1 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div className="space-y-1">
            <h4 className="text-base font-bold text-slate-800 dark:text-slate-100">{transaction.title}</h4>
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">
              {transaction.category} • {formatDate(transaction.date)}
            </p>
            {transaction.notes && !compact && (
              <p className="text-xs text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/40 mt-1 max-w-md">
                {transaction.notes}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
            {/* Amount and Type Badge */}
            <div className="flex items-center gap-2.5 sm:flex-col sm:items-end">
              <div className="flex flex-col sm:items-end">
                <span className={`text-lg font-extrabold tracking-tight ${
                  transaction.type === 'income' ? 'text-emerald-500' : 'text-rose-500'
                }`}>
                  {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount, txCurrency)}
                </span>
                {txCurrency !== currency && canConvert(txCurrency, currency, rates) && (
                  <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">
                    ≈ {formatCurrency(convertCurrency(transaction.amount, txCurrency, currency), currency)}
                  </span>
                )}
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg ${
                transaction.type === 'income'
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
              }`}>
                {transaction.type}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                title="Edit Transaction"
              >
                <Edit2 className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setShowDelete(true)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-rose-200/50 bg-rose-50/50 text-rose-600 transition hover:bg-rose-100 hover:text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/20 dark:text-rose-400 dark:hover:bg-rose-950/40"
                title="Delete Transaction"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showDelete && (
        <DeleteModal
          title="Delete transaction"
          message="Are you sure you want to permanently remove this transaction? This action cannot be undone."
          onConfirm={() => {
            deleteTransaction(transaction.id)
            setShowDelete(false)
          }}
          onCancel={() => setShowDelete(false)}
        />
      )}
      
      <TransactionModal
        open={isEditing}
        onOpenChange={setIsEditing}
        hideTrigger
        initialTransaction={transaction}
        triggerLabel="Edit transaction"
      />
    </>
  )
}

export default TransactionCard
