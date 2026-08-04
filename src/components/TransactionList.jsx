import { motion } from 'framer-motion'
import TransactionCard from './TransactionCard.jsx'

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 260, damping: 25 },
  },
}

function TransactionList({ items }) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid gap-4"
    >
      {items.map((transaction) => (
        <motion.div key={transaction.id} variants={itemVariants} layout>
          <TransactionCard transaction={transaction} />
        </motion.div>
      ))}
    </motion.div>
  )
}

export default TransactionList
