import { motion } from 'framer-motion'
import { useExpenseContext } from '../context/ExpenseContext.jsx'
import TransactionList from '../components/TransactionList.jsx'
import AddTransactionModal from '../components/AddTransactionModal.jsx'
import Filters from '../components/Filters.jsx'
import EmptyState from '../components/EmptyState.jsx'

function Transactions() {
  const { filteredTransactions, isLoading } = useExpenseContext()

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[2rem] border border-slate-200/80 bg-white/80 p-6 shadow-soft backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950/80">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-indigo-600 dark:text-indigo-400">Transactions</p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-900 dark:text-slate-100">Your full financial activity</h1>
          </div>
          <AddTransactionModal />
        </div>
        <Filters />
      </div>

      {isLoading ? (
        <EmptyState loading />
      ) : filteredTransactions.length ? (
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
        >
          <TransactionList items={filteredTransactions} />
        </motion.div>
      ) : (
        <EmptyState message="No transactions match your filters or search." />
      )}
    </div>
  )
}

export default Transactions
