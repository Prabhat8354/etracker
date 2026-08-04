import { motion } from 'framer-motion'
import { useExpenseContext } from '../context/ExpenseContext.jsx'
import TransactionList from '../components/TransactionList.jsx'
import AddTransactionModal from '../components/AddTransactionModal.jsx'
import Filters from '../components/Filters.jsx'
import EmptyState from '../components/EmptyState.jsx'
import { Sparkles } from 'lucide-react'

function Transactions() {
  const { filteredTransactions, isLoading } = useExpenseContext()

  return (
    <div className="space-y-6 pb-10">
      
      {/* Unified Transaction Control Header Card */}
      <div className="rounded-3xl border border-slate-200/30 bg-white/60 p-8 shadow-soft backdrop-blur-md dark:border-white/[0.02] dark:bg-slate-950/40 relative overflow-hidden space-y-6">
        <div className="absolute -top-16 -right-16 h-36 w-36 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none" />

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
              <p className="text-[9px] font-black uppercase tracking-[0.25em] text-indigo-600 dark:text-indigo-400">Ledger</p>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white leading-tight">
              Financial Logs Activity
            </h1>
          </div>
          
          <AddTransactionModal />
        </div>

        {/* Filters section */}
        <Filters />
      </div>

      {/* Transaction List content */}
      {isLoading ? (
        <EmptyState loading />
      ) : filteredTransactions.length ? (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
        >
          <TransactionList items={filteredTransactions} />
        </motion.div>
      ) : (
        <EmptyState variant="search" message="No matching transactions found." />
      )}
    </div>
  )
}

export default Transactions
