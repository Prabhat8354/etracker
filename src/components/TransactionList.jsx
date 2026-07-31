import TransactionCard from './TransactionCard.jsx'

function TransactionList({ items }) {
  return (
    <div className="grid gap-5">
      {items.map((transaction) => (
        <TransactionCard key={transaction.id} transaction={transaction} />
      ))}
    </div>
  )
}

export default TransactionList
