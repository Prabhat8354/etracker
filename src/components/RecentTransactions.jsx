import TransactionCard from './TransactionCard.jsx'

function RecentTransactions({ items }) {
  return (
    <div className="space-y-4">
      {items.map((transaction) => (
        <TransactionCard key={transaction.id} transaction={transaction} compact />
      ))}
    </div>
  )
}

export default RecentTransactions
