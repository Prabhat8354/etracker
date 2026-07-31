import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { sampleCategories } from '../data/sampleData.jsx'
import { calculateSummary, generateGreeting, loadFromStorage, saveToStorage } from '../utils/helpers.jsx'
import { useAuthContext } from './AuthContext.jsx'

const ExpenseContext = createContext(null)

const userStorageKey = (uid, key) => `etracker_${uid}_${key}`

export function ExpenseProvider({ children }) {
  const { user, authLoading } = useAuthContext()
  const [transactions, setTransactions] = useState([])
  const [darkMode, setDarkMode] = useState(false)
  const [filters, setFilters] = useState({ type: 'all', category: 'all', sort: 'newest', query: '', range: 'all' })
  const [settings, setSettings] = useState({ currency: 'USD', monthlyBudget: 3000 })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      setTransactions([])
      setDarkMode(false)
      setFilters({ type: 'all', category: 'all', sort: 'newest', query: '', range: 'all' })
      setSettings({ currency: 'USD' })
      setIsLoading(false)
      return
    }

    const storedData = loadFromStorage(userStorageKey(user.uid, 'data'))
    const storedDark = loadFromStorage(userStorageKey(user.uid, 'dark'))
    const storedFilters = loadFromStorage(userStorageKey(user.uid, 'filters'))
    const storedSettings = loadFromStorage(userStorageKey(user.uid, 'settings'))

    setTransactions(storedData ?? [])
    setDarkMode(storedDark ?? false)
    setFilters(storedFilters ?? { type: 'all', category: 'all', sort: 'newest', query: '', range: 'all' })
    setSettings(storedSettings ?? { currency: 'USD', monthlyBudget: 3000 })
    setIsLoading(false)
  }, [authLoading, user])

  useEffect(() => {
    if (!user || authLoading || isLoading) return
    saveToStorage(userStorageKey(user.uid, 'data'), transactions)
    saveToStorage(userStorageKey(user.uid, 'dark'), darkMode)
    saveToStorage(userStorageKey(user.uid, 'filters'), filters)
    saveToStorage(userStorageKey(user.uid, 'settings'), settings)
  }, [user, authLoading, isLoading, transactions, darkMode, filters, settings])

  useEffect(() => {
    document.body.classList.toggle('dark', darkMode)
  }, [darkMode])

  const filteredTransactions = useMemo(() => {
    const normalizedQuery = filters.query.trim().toLowerCase()
    return transactions
      .filter((item) => {
        if (filters.type !== 'all' && item.type !== filters.type) return false
        if (filters.category !== 'all' && item.category !== filters.category) return false
        if (filters.range !== 'all') {
          const now = new Date()
          const itemDate = new Date(item.date)
          if (filters.range === 'last30') {
            const threshold = new Date(now.setDate(now.getDate() - 30))
            if (itemDate < threshold) return false
          }
          if (filters.range === 'last7') {
            const threshold = new Date(now.setDate(now.getDate() - 7))
            if (itemDate < threshold) return false
          }
        }
        if (!normalizedQuery) return true
        return [item.title, item.category, item.notes].some((value) => value.toLowerCase().includes(normalizedQuery))
      })
      .sort((a, b) => {
        if (filters.sort === 'oldest') return new Date(a.date) - new Date(b.date)
        if (filters.sort === 'highest') return b.amount - a.amount
        if (filters.sort === 'lowest') return a.amount - b.amount
        return new Date(b.date) - new Date(a.date)
      })
  }, [transactions, filters])

  const summary = useMemo(() => calculateSummary(transactions), [transactions])
  const greeting = useMemo(() => generateGreeting(), [])

  const addTransaction = (transaction) => {
    setTransactions((prev) => [transaction, ...prev])
    toast.success('Transaction added successfully')
  }
  const updateTransaction = (updatedTransaction) => {
    setTransactions((prev) => prev.map((item) => (item.id === updatedTransaction.id ? updatedTransaction : item)))
    toast.success('Transaction updated successfully')
  }
  const deleteTransaction = (id) => {
    setTransactions((prev) => prev.filter((item) => item.id !== id))
    toast.success('Transaction deleted successfully')
  }
  const resetData = () => {
    setTransactions([])
    setFilters({ type: 'all', category: 'all', sort: 'newest', query: '', range: 'all' })
    setSettings({ currency: 'USD', monthlyBudget: 3000 })
    setDarkMode(false)
    toast.success('All data cleared')
  }

  return (
    <ExpenseContext.Provider
      value={{
        transactions,
        filteredTransactions,
        summary,
        greeting,
        categories: sampleCategories,
        darkMode,
        setDarkMode,
        filters,
        setFilters,
        settings,
        setSettings,
        setTransactions,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        resetData,
        isLoading,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  )
}

export const useExpenseContext = () => useContext(ExpenseContext)
