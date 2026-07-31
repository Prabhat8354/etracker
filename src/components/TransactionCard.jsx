import { useState } from 'react'
import { FiEdit2, FiTrash2 } from 'react-icons/fi'
import { formatCurrency, formatDate, getCategoryColor } from '../utils/helpers.jsx'
import { useExpenseContext } from '../context/ExpenseContext.jsx'
import DeleteModal from './DeleteModal.jsx'
import TransactionModal from './AddTransactionModal.jsx'

function TransactionCard({ transaction, compact }) {
  const { deleteTransaction } = useExpenseContext()
  const [showDelete, setShowDelete] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  return (
    <>
      <div className={`rounded-[2rem] border border-slate-200/80 bg-white/90 p-5 shadow-soft backdrop-blur-xl transition hover:-translate-y-1 hover:shadow-glow dark:border-slate-800/80 dark:bg-slate-950/90 ${compact ? 'grid grid-cols-[auto_1fr] gap-4' : ''}`}>
        <div className={`inline-flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br ${getCategoryColor(transaction.category)} text-white shadow-lg shadow-slate-300/20`}>
          <span className="text-2xl">{transaction.category.charAt(0)}</span>
        </div>
        <div className="flex flex-col justify-between gap-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">{transaction.title}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">{transaction.category} • {formatDate(transaction.date)}</p>
            </div>
            <div className={`rounded-3xl px-3 py-2 text-sm font-semibold ${transaction.type === 'income' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'} dark:bg-opacity-20`}>
              {transaction.type}
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className={`text-xl font-semibold ${transaction.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
              {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-2 rounded-3xl border border-slate-200 px-4 py-2 text-sm text-slate-600 transition hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900/80"
              >
                <FiEdit2 className="h-4 w-4" />
                Edit
              </button>
              <button
                type="button"
                onClick={() => setShowDelete(true)}
                className="inline-flex items-center gap-2 rounded-3xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 dark:border-rose-700/40 dark:bg-rose-950/70 dark:text-rose-200"
              >
                <FiTrash2 className="h-4 w-4" />
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
      {showDelete && (
        <DeleteModal
          title="Delete transaction"
          message="This action will permanently remove the transaction from your dashboard."
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
