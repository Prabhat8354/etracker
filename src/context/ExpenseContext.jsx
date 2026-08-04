import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { sampleCategories } from '../data/sampleData.jsx'
import { calculateSummary, generateGreeting, loadFromStorage, saveToStorage } from '../utils/helpers.jsx'
import { useAuthContext } from './AuthContext.jsx'

const ExpenseContext = createContext(null)

const userStorageKey = (uid, key) => `etracker_${uid}_${key}`

const defaultRates = {
  USD: 1,
  INR: 83.5,
  EUR: 0.92,
  GBP: 0.78,
  JPY: 155.0,
  CAD: 1.37,
  AUD: 1.52,
  AED: 3.67,
  SAR: 3.75,
  SGD: 1.34
}

const quotes = [
  "Do not save what is left after spending, but spend what is left after saving. — Warren Buffett",
  "Beware of little expenses; a small leak will sink a great ship. — Benjamin Franklin",
  "A penny saved is a penny earned. — Benjamin Franklin",
  "Money is a terrible master but an excellent servant. — P.T. Barnum",
  "The safe way to double your money is to fold it over once and put it in your pocket. — Kin Hubbard",
  "It’s not how much money you make, it’s how much money you keep. — Robert Kiyosaki",
  "Frugality without creativity is deprivation. — Amy Dacyczyn"
]

export function ExpenseProvider({ children }) {
  const { user, authLoading } = useAuthContext()
  const [transactions, setTransactions] = useState([])
  const [bills, setBills] = useState([])
  const [darkMode, setDarkMode] = useState(false)
  const [filters, setFilters] = useState({ type: 'all', category: 'all', sort: 'newest', query: '', range: 'all' })
  const [settings, setSettings] = useState({
    currency: 'USD',
    monthlyBudget: 3000,
    savingsGoal: 500,
    savingsGoalPeriod: 'monthly',
    language: 'en',
    animationSpeed: 'normal',
    notificationsEnabled: true
  })
  const [isLoading, setIsLoading] = useState(true)
  const [rates, setRates] = useState(() => loadFromStorage('etracker_exchange_rates') ?? defaultRates)

  // Fetch exchange rates from free open API
  useEffect(() => {
    const fetchRates = async () => {
      try {
        const res = await fetch('https://open.er-api.com/v6/latest/USD')
        const data = await res.json()
        if (data && data.rates) {
          const newRates = {
            USD: 1,
            INR: data.rates.INR || 83.5,
            EUR: data.rates.EUR || 0.92,
            GBP: data.rates.GBP || 0.78,
            JPY: data.rates.JPY || 155.0,
            CAD: data.rates.CAD || 1.37,
            AUD: data.rates.AUD || 1.52,
            AED: data.rates.AED || 3.67,
            SAR: data.rates.SAR || 3.75,
            SGD: data.rates.SGD || 1.34
          }
          setRates(newRates)
          saveToStorage('etracker_exchange_rates', newRates)
        }
      } catch (error) {
        console.error('Failed to fetch exchange rates, using local fallback', error)
        const stored = loadFromStorage('etracker_exchange_rates')
        if (stored) setRates(stored)
      }
    }
    fetchRates()
  }, [])

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      setTransactions([])
      setBills([])
      setDarkMode(false)
      setFilters({ type: 'all', category: 'all', sort: 'newest', query: '', range: 'all' })
      setSettings({
        currency: 'USD',
        monthlyBudget: 3000,
        savingsGoal: 500,
        savingsGoalPeriod: 'monthly',
        language: 'en',
        animationSpeed: 'normal',
        notificationsEnabled: true
      })
      setIsLoading(false)
      return
    }

    const storedData = loadFromStorage(userStorageKey(user.uid, 'data'))
    const storedBills = loadFromStorage(userStorageKey(user.uid, 'bills'))
    const storedDark = loadFromStorage(userStorageKey(user.uid, 'dark'))
    const storedFilters = loadFromStorage(userStorageKey(user.uid, 'filters'))
    const storedSettings = loadFromStorage(userStorageKey(user.uid, 'settings'))

    setTransactions(storedData ?? [])
    setBills(storedBills ?? [
      { id: '1', name: 'Adobe Creative Suite', amount: 52.99, date: '2026-08-12', category: 'Entertainment', repeat: 'monthly', status: 'pending' },
      { id: '2', name: 'Vercel Pro Hosting', amount: 20.00, date: '2026-08-18', category: 'Software', repeat: 'monthly', status: 'pending' },
      { id: '3', name: 'AWS Cloud server', amount: 145.50, date: '2026-08-24', category: 'Software', repeat: 'monthly', status: 'pending' }
    ])
    setDarkMode(storedDark ?? false)
    setFilters(storedFilters ?? { type: 'all', category: 'all', sort: 'newest', query: '', range: 'all' })
    setSettings(storedSettings ?? {
      currency: 'USD',
      monthlyBudget: 3000,
      savingsGoal: 500,
      savingsGoalPeriod: 'monthly',
      language: 'en',
      animationSpeed: 'normal',
      notificationsEnabled: true
    })
    setIsLoading(false)
  }, [authLoading, user])

  useEffect(() => {
    if (!user || authLoading || isLoading) return
    saveToStorage(userStorageKey(user.uid, 'data'), transactions)
    saveToStorage(userStorageKey(user.uid, 'bills'), bills)
    saveToStorage(userStorageKey(user.uid, 'dark'), darkMode)
    saveToStorage(userStorageKey(user.uid, 'filters'), filters)
    saveToStorage(userStorageKey(user.uid, 'settings'), settings)
  }, [user, authLoading, isLoading, transactions, bills, darkMode, filters, settings])

  useEffect(() => {
    document.body.classList.toggle('dark', darkMode)
  }, [darkMode])

  // Conversion helpers
  const convertAmount = (amountInUSD) => {
    const rate = rates[settings.currency] || 1
    return amountInUSD * rate
  }

  const convertToUSD = (amountInPreferred) => {
    const rate = rates[settings.currency] || 1
    return amountInPreferred / rate
  }

  // Filter and map transaction amounts to the preferred currency dynamically
  const filteredTransactions = useMemo(() => {
    const normalizedQuery = filters.query.trim().toLowerCase()
    const rate = rates[settings.currency] || 1
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
      .map((item) => ({
        ...item,
        amount: item.amount * rate
      }))
      .sort((a, b) => {
        if (filters.sort === 'oldest') return new Date(a.date) - new Date(b.date)
        if (filters.sort === 'highest') return b.amount - a.amount
        if (filters.sort === 'lowest') return a.amount - b.amount
        return new Date(b.date) - new Date(a.date)
      })
  }, [transactions, filters, rates, settings.currency])

  // Converted summary details
  const summary = useMemo(() => {
    const usdSummary = calculateSummary(transactions)
    const rate = rates[settings.currency] || 1
    return {
      income: usdSummary.income * rate,
      expense: usdSummary.expense * rate,
      balance: usdSummary.balance * rate,
      savings: Math.max(0, usdSummary.balance) * rate, // Net Balance (Inflow - Outflow)
      incomeChange: usdSummary.incomeChange,
      expenseChange: usdSummary.expenseChange
    }
  }, [transactions, rates, settings.currency])

  const greeting = useMemo(() => generateGreeting(), [])
  const quote = useMemo(() => quotes[Math.floor(Math.random() * quotes.length)], [])

  // Input transactions are assumed to be in the preferred currency. Convert to USD base before storage.
  const addTransaction = (transaction) => {
    const rate = rates[settings.currency] || 1
    const usdAmount = Number(transaction.amount) / rate
    const newTx = { ...transaction, amount: usdAmount }
    setTransactions((prev) => [newTx, ...prev])
    toast.success('Transaction added successfully')
  }

  const updateTransaction = (updatedTransaction) => {
    const rate = rates[settings.currency] || 1
    const usdAmount = Number(updatedTransaction.amount) / rate
    const newTx = { ...updatedTransaction, amount: usdAmount }
    setTransactions((prev) => prev.map((item) => (item.id === updatedTransaction.id ? newTx : item)))
    toast.success('Transaction updated successfully')
  }

  const deleteTransaction = (id) => {
    setTransactions((prev) => prev.filter((item) => item.id !== id))
    toast.success('Transaction deleted successfully')
  }

  // Bills Management Actions
  const addBill = (bill) => {
    setBills((prev) => [bill, ...prev])
    toast.success('Bill registered successfully')
  }

  const updateBill = (updatedBill) => {
    setBills((prev) => prev.map((item) => (item.id === updatedBill.id ? updatedBill : item)))
    toast.success('Bill updated successfully')
  }

  const deleteBill = (id) => {
    setBills((prev) => prev.filter((item) => item.id !== id))
    toast.success('Bill removed successfully')
  }

  const toggleBillStatus = (id) => {
    setBills((prev) => prev.map((item) => {
      if (item.id === id) {
        const nextStatus = item.status === 'paid' ? 'pending' : 'paid'
        toast.success(`Bill marked as ${nextStatus}`)
        return { ...item, status: nextStatus }
      }
      return item
    }))
  }

  const resetData = () => {
    setTransactions([])
    setBills([])
    setFilters({ type: 'all', category: 'all', sort: 'newest', query: '', range: 'all' })
    setSettings({
      currency: 'USD',
      monthlyBudget: 3000,
      savingsGoal: 500,
      savingsGoalPeriod: 'monthly',
      language: 'en',
      animationSpeed: 'normal',
      notificationsEnabled: true
    })
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
        quote,
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
        rates,
        convertAmount,
        convertToUSD,
        bills,
        setBills,
        addBill,
        updateBill,
        deleteBill,
        toggleBillStatus
      }}
    >
      {children}
    </ExpenseContext.Provider>
  )
}

export const useExpenseContext = () => useContext(ExpenseContext)
