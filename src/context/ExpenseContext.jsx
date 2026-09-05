import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { sampleCategories } from '../data/sampleData.jsx'
import { calculateSummary, generateGreeting, loadFromStorage, saveToStorage, parseLocalDate } from '../utils/helpers.jsx'
import { useAuthContext } from './AuthContext.jsx'
import { db } from '../firebase/firebaseConfig.js'
import { collection, doc, setDoc, deleteDoc, updateDoc, onSnapshot, query, getDocs, addDoc, serverTimestamp } from 'firebase/firestore'
import { convertCurrency as _convertCurrency } from '../utils/currency.js'

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
  const [savingsGoal, setSavingsGoal] = useState({
    amount: 500,
    frequency: 'monthly',
    currency: 'USD'
  })
  const [darkMode, setDarkMode] = useState(() => {
    try {
      return localStorage.getItem('etracker_theme_dark') === 'true'
    } catch {
      return false
    }
  })
  const [filters, setFilters] = useState({ type: 'all', category: 'all', sort: 'newest', query: '', range: 'all' })
  const [settings, setSettings] = useState({
    currency: 'USD',
    monthlyBudget: 3000,
    language: 'en',
    animationSpeed: 'normal'
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

  // Set up realtime Firestore synchronization for transactions with local storage migration
  useEffect(() => {
    if (authLoading) return
    if (!user) {
      setTransactions([])
      return
    }

    if (!db) {
      console.warn("Firestore database is not configured. Falling back to local storage.")
      const storedData = loadFromStorage(userStorageKey(user.uid, 'data'))
      setTransactions(storedData ?? [])
      setIsLoading(false)
      return
    }

    const localData = loadFromStorage(userStorageKey(user.uid, 'data')) || []

    const q = collection(db, 'users', user.uid, 'transactions')
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const dbTxs = {}
      snapshot.forEach((doc) => {
        dbTxs[doc.id] = { id: doc.id, ...doc.data() }
      })

      // Perform one-time migration of local storage data to Firestore
      if (localData.length > 0) {
        let migratedAny = false
        for (const localTx of localData) {
          if (!dbTxs[localTx.id]) {
            const migratedTx = {
              userId: user.uid,
              title: localTx.title || 'Untitled',
              amount: Number(localTx.amount) || 0,
              currency: localTx.currency || 'unknown',
              category: localTx.category || 'Other',
              notes: localTx.notes || '',
              type: localTx.type || 'expense',
              date: localTx.date || new Date().toISOString().slice(0, 10),
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            }
            try {
              await setDoc(doc(db, 'users', user.uid, 'transactions', localTx.id), migratedTx)
              dbTxs[localTx.id] = { id: localTx.id, ...migratedTx }
              migratedAny = true
            } catch (err) {
              console.error("Migration failed for transaction:", localTx.id, err)
            }
          }
        }
        if (migratedAny) {
          saveToStorage(userStorageKey(user.uid, 'data'), [])
        }
      }

      setTransactions(Object.values(dbTxs))
      setIsLoading(false)
    }, (error) => {
      console.error("Firestore transaction listener failed:", error)
      toast.error("Unable to load transactions. Please check your connection and Firestore security rules.")
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [authLoading, user])

  // Set up local settings, filters, and bills from localStorage & Firestore settings sync
  useEffect(() => {
    if (authLoading) return
    if (!user) {
      setFilters({ type: 'all', category: 'all', sort: 'newest', query: '', range: 'all' })
      setSettings({
        currency: 'USD',
        monthlyBudget: 3000,
        language: 'en',
        animationSpeed: 'normal'
      })
      return
    }

    const storedFilters = loadFromStorage(userStorageKey(user.uid, 'filters'))
    setFilters(storedFilters ?? { type: 'all', category: 'all', sort: 'newest', query: '', range: 'all' })

    if (!db) {
      const storedSettings = loadFromStorage(userStorageKey(user.uid, 'settings'))
      if (storedSettings) setSettings(storedSettings)
      return
    }

    // Subscribe to settings in Firestore
    const docRef = doc(db, 'users', user.uid, 'settings', 'config')
    const unsubscribe = onSnapshot(docRef, async (docSnap) => {
      if (docSnap.exists()) {
        const remoteSettings = docSnap.data()
        setSettings((prev) => {
          const keys = Object.keys(remoteSettings)
          const isDifferent = keys.some(key => prev[key] !== remoteSettings[key])
          return isDifferent ? remoteSettings : prev
        })
      } else {
        // If not in Firestore yet, read localStorage settings or defaults, then push to Firestore
        const storedSettings = loadFromStorage(userStorageKey(user.uid, 'settings')) || {
          currency: 'USD',
          monthlyBudget: 3000,
          language: 'en',
          animationSpeed: 'normal'
        }
        const cleanSettings = {
          currency: storedSettings.currency ?? 'USD',
          monthlyBudget: storedSettings.monthlyBudget ?? 3000,
          language: storedSettings.language ?? 'en',
          animationSpeed: storedSettings.animationSpeed ?? 'normal'
        }
        try {
          await setDoc(docRef, cleanSettings)
          setSettings(cleanSettings)
        } catch (err) {
          console.error("Failed to write default settings to Firestore:", err)
        }
      }
    }, (error) => {
      console.error("Firestore settings listener failed:", error)
      toast.error("Unable to load settings configuration. Please check your Firestore security rules.")
    })

    return () => unsubscribe()
  }, [authLoading, user])

  // Helper to distinguish demo/mock commitment records from real user-created records
  const isMockCommitment = (data, id) => {
    if (id === '1' || id === '2' || id === '3') return true
    const name = (data?.name || '').trim().toLowerCase()
    return name === 'adobe creative suite' || name === 'vercel pro hosting' || name === 'aws cloud server'
  }

  // Set up realtime Firestore synchronization for commitments (users/{uid}/commitments)
  useEffect(() => {
    if (authLoading) return
    if (!user) {
      setBills([])
      return
    }

    if (!db) {
      const stored = loadFromStorage(userStorageKey(user.uid, 'commitments')) || loadFromStorage(userStorageKey(user.uid, 'bills')) || []
      const cleaned = stored.filter((item) => !isMockCommitment(item, item.id))
      setBills(cleaned)
      return
    }

    // One-time cleanup of legacy mock bills and migration of real user bills to commitments
    const cleanupAndMigrateLegacy = async () => {
      try {
        const legacyBillsQuery = collection(db, 'users', user.uid, 'bills')
        const legacySnap = await getDocs(legacyBillsQuery)
        for (const docSnap of legacySnap.docs) {
          const data = docSnap.data()
          if (isMockCommitment(data, docSnap.id)) {
            // Delete mock records from Firestore
            await deleteDoc(doc(db, 'users', user.uid, 'bills', docSnap.id))
          } else {
            // Migrate real user records to commitments collection
            await setDoc(doc(db, 'users', user.uid, 'commitments', docSnap.id), {
              ...data,
              dueDate: data.dueDate || data.date || new Date().toISOString().slice(0, 10),
              date: data.date || data.dueDate || new Date().toISOString().slice(0, 10),
              frequency: data.frequency || data.repeat || 'monthly',
              repeat: data.repeat || data.frequency || 'monthly'
            }, { merge: true })
            await deleteDoc(doc(db, 'users', user.uid, 'bills', docSnap.id))
          }
        }
      } catch (err) {
        console.warn("Legacy bills cleanup notice:", err)
      }
    }
    cleanupAndMigrateLegacy()

    // Real-time listener for commitments
    const q = collection(db, 'users', user.uid, 'commitments')
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const dbCommitments = {}
      for (const docSnap of snapshot.docs) {
        const data = docSnap.data()
        if (isMockCommitment(data, docSnap.id)) {
          // Delete any lingering mock records found in commitments
          try {
            await deleteDoc(doc(db, 'users', user.uid, 'commitments', docSnap.id))
          } catch (_) {}
        } else {
          dbCommitments[docSnap.id] = {
            id: docSnap.id,
            ...data,
            name: data.name || '',
            amount: Number(data.amount) || 0,
            dueDate: data.dueDate || data.date || '',
            date: data.date || data.dueDate || '',
            frequency: data.frequency || data.repeat || 'monthly',
            repeat: data.repeat || data.frequency || 'monthly',
            category: data.category || 'Subscription',
            status: data.status || 'pending'
          }
        }
      }

      const list = Object.values(dbCommitments)
      setBills(list)
      saveToStorage(userStorageKey(user.uid, 'commitments'), list)
    }, (error) => {
      console.error("Firestore commitments listener failed:", error)
      toast.error("Unable to load upcoming commitments. Please check your connection.")
    })

    return () => unsubscribe()
  }, [authLoading, user])

  // Set up realtime Firestore synchronization for savings goals
  useEffect(() => {
    if (authLoading) return
    if (!user) {
      setSavingsGoal({
        amount: 500,
        frequency: 'monthly',
        currency: 'USD'
      })
      return
    }

    if (!db) {
      const storedSettings = loadFromStorage(userStorageKey(user.uid, 'settings')) || {}
      setSavingsGoal({
        amount: storedSettings.savingsGoal ?? 500,
        frequency: storedSettings.savingsGoalPeriod ?? 'monthly',
        currency: storedSettings.currency ?? 'USD'
      })
      return
    }

    const docRef = doc(db, 'users', user.uid, 'savings', 'goal')
    const unsubscribe = onSnapshot(docRef, async (docSnap) => {
      if (docSnap.exists()) {
        const remoteGoal = docSnap.data()
        setSavingsGoal((prev) => {
          const keys = Object.keys(remoteGoal)
          const isDifferent = keys.some(key => prev[key] !== remoteGoal[key])
          return isDifferent ? remoteGoal : prev
        })
      } else {
        // Create default savings goal target
        const storedSettings = loadFromStorage(userStorageKey(user.uid, 'settings')) || {}
        const defaultGoal = {
          amount: storedSettings.savingsGoal ?? 500,
          frequency: storedSettings.savingsGoalPeriod ?? 'monthly',
          currency: storedSettings.currency ?? 'USD'
        }
        try {
          await setDoc(docRef, defaultGoal)
          setSavingsGoal(defaultGoal)
        } catch (err) {
          console.error("Failed to write default savings goal to Firestore:", err)
        }
      }
    }, (error) => {
      console.error("Firestore savings goal listener failed:", error)
      toast.error("Unable to load savings goal. Please check your Firestore security rules.")
    })

    return () => unsubscribe()
  }, [authLoading, user])

  // Save changes to localStorage and Firestore settings
  useEffect(() => {
    if (!user || authLoading || isLoading) return
    saveToStorage(userStorageKey(user.uid, 'filters'), filters)

    const saveSettingsToFirestore = async () => {
      try {
        await setDoc(doc(db, 'users', user.uid, 'settings', 'config'), settings)
        saveToStorage(userStorageKey(user.uid, 'settings'), settings)
      } catch (err) {
        console.error("Failed to save settings to Firestore:", err)
        toast.error("Unable to save settings. Please check your connection and Firestore security rules.")
      }
    }
    saveSettingsToFirestore()
  }, [user, authLoading, isLoading, bills, filters, settings])

  useEffect(() => {
    try {
      localStorage.setItem('etracker_theme_dark', String(darkMode))
    } catch (e) {
      console.error(e)
    }
    document.body.classList.toggle('dark', darkMode)
  }, [darkMode])

  // Conversion helpers
  const convertCurrency = (amount, fromCurrency, toCurrency) => {
    return _convertCurrency(amount, fromCurrency, toCurrency, rates)
  }

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
    return transactions
      .filter((item) => {
        if (filters.type !== 'all' && item.type !== filters.type) return false
        if (filters.category !== 'all' && item.category !== filters.category) return false
        if (filters.range !== 'all') {
          const now = new Date()
          const itemDate = parseLocalDate(item.date)
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
        return [item.title, item.category, item.notes].some((value) => (value || '').toLowerCase().includes(normalizedQuery))
      })
      .sort((a, b) => {
        const valA = convertCurrency(a.amount, a.currency || 'USD', settings.currency)
        const valB = convertCurrency(b.amount, b.currency || 'USD', settings.currency)
        if (filters.sort === 'oldest') return parseLocalDate(a.date) - parseLocalDate(b.date)
        if (filters.sort === 'highest') return valB - valA
        if (filters.sort === 'lowest') return valA - valB
        return parseLocalDate(b.date) - parseLocalDate(a.date)
      })
  }, [transactions, filters, rates, settings.currency])

  // Converted summary details
  const summary = useMemo(() => {
    const usdSummary = calculateSummary(transactions, rates)
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

  const addTransaction = async (transaction) => {
    if (!user) {
      toast.error('You must be logged in to add transactions.')
      return
    }
    const transactionsRef = collection(db, 'users', user.uid, 'transactions')
    const newTx = {
      userId: user.uid,
      title: transaction.title || '',
      amount: Number(transaction.amount) || 0,
      currency: transaction.currency || settings.currency || 'USD',
      category: transaction.category || 'Other',
      notes: transaction.notes || '',
      type: transaction.type || 'expense',
      date: transaction.date || new Date().toISOString().slice(0, 10),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }

    console.log("Firestore transaction write:", newTx);

    try {
      const docRef = await addDoc(transactionsRef, newTx)
      console.log("Firestore transaction ID:", docRef.id);
      toast.success('Transaction added successfully')
    } catch (error) {
      console.error("Firestore transaction write failed:", error);
      toast.error('Failed to save transaction: ' + error.message)
    }
  }

  const updateTransaction = async (updatedTransaction) => {
    if (!user) return
    const newTx = {
      title: updatedTransaction.title || '',
      amount: Number(updatedTransaction.amount) || 0,
      currency: updatedTransaction.currency || settings.currency || 'USD',
      category: updatedTransaction.category || 'Other',
      notes: updatedTransaction.notes || '',
      type: updatedTransaction.type || 'expense',
      date: updatedTransaction.date || new Date().toISOString().slice(0, 10),
      updatedAt: serverTimestamp()
    }
    try {
      await updateDoc(doc(db, 'users', user.uid, 'transactions', updatedTransaction.id), newTx)
      toast.success('Transaction updated successfully')
    } catch (error) {
      console.error('Firestore update failed:', error)
      toast.error('Failed to update transaction: ' + error.message)
    }
  }

  const deleteTransaction = async (id) => {
    if (!user) return
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'transactions', id))
      toast.success('Transaction deleted successfully')
    } catch (error) {
      console.error('Firestore delete failed:', error)
      toast.error('Failed to delete transaction: ' + error.message)
    }
  }

  // Commitments / Bills Management Actions
  const addBill = async (bill) => {
    if (!user) {
      toast.error('You must be signed in to add commitments.')
      return
    }
    const commitmentId = bill.id || uuidv4()
    const newCommitment = {
      id: commitmentId,
      name: bill.name || '',
      amount: Number(bill.amount) || 0,
      dueDate: bill.dueDate || bill.date || new Date().toISOString().slice(0, 10),
      date: bill.date || bill.dueDate || new Date().toISOString().slice(0, 10),
      frequency: bill.frequency || bill.repeat || 'monthly',
      repeat: bill.repeat || bill.frequency || 'monthly',
      category: bill.category || 'Subscription',
      status: bill.status || 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }

    setBills((prev) => [newCommitment, ...prev])
    try {
      await setDoc(doc(db, 'users', user.uid, 'commitments', commitmentId), newCommitment)
      toast.success('Commitment added successfully')
    } catch (err) {
      console.error("Failed to add commitment:", err)
      setBills((prev) => prev.filter((item) => item.id !== commitmentId))
      toast.error("Failed to save commitment: " + err.message)
    }
  }

  const updateBill = async (updatedBill) => {
    if (!user) return
    const prevBills = bills
    const updatedData = {
      ...updatedBill,
      amount: Number(updatedBill.amount) || 0,
      dueDate: updatedBill.dueDate || updatedBill.date || '',
      date: updatedBill.date || updatedBill.dueDate || '',
      frequency: updatedBill.frequency || updatedBill.repeat || 'monthly',
      repeat: updatedBill.repeat || updatedBill.frequency || 'monthly',
      category: updatedBill.category || 'Subscription',
      status: updatedBill.status || 'pending',
      updatedAt: serverTimestamp()
    }
    setBills((prev) => prev.map((item) => (item.id === updatedBill.id ? updatedData : item)))
    try {
      await setDoc(doc(db, 'users', user.uid, 'commitments', updatedBill.id), updatedData, { merge: true })
      toast.success('Commitment updated successfully')
    } catch (err) {
      console.error("Failed to update commitment:", err)
      setBills(prevBills)
      toast.error("Failed to update commitment: " + err.message)
    }
  }

  const deleteBill = async (id) => {
    if (!user) return
    const prevBills = bills
    setBills((prev) => prev.filter((item) => item.id !== id))
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'commitments', id))
      try {
        await deleteDoc(doc(db, 'users', user.uid, 'bills', id))
      } catch (_) {}
      toast.success('Commitment deleted successfully')
    } catch (err) {
      console.error("Failed to delete commitment:", err)
      setBills(prevBills)
      toast.error("Failed to delete commitment: " + err.message)
    }
  }

  const toggleBillStatus = async (id) => {
    if (!user) return
    const bill = bills.find((b) => b.id === id)
    if (!bill) return
    const nextStatus = bill.status === 'paid' ? 'pending' : 'paid'
    const prevBills = bills
    setBills((prev) => prev.map((item) => (item.id === id ? { ...item, status: nextStatus } : item)))
    try {
      await updateDoc(doc(db, 'users', user.uid, 'commitments', id), {
        status: nextStatus,
        updatedAt: serverTimestamp()
      })
      toast.success(`Commitment marked as ${nextStatus}`)
    } catch (err) {
      console.error("Failed to toggle commitment status:", err)
      setBills(prevBills)
      toast.error("Failed to update commitment status: " + err.message)
    }
  }

  const updateSavingsGoal = async (updatedGoal) => {
    if (!user) return
    const goalData = {
      amount: Number(updatedGoal.amount) || 0,
      frequency: updatedGoal.frequency || 'monthly',
      currency: updatedGoal.currency || 'USD'
    }
    setSavingsGoal(goalData)
    try {
      await setDoc(doc(db, 'users', user.uid, 'savings', 'goal'), goalData)
    } catch (err) {
      console.error("Failed to update savings goal in Firestore:", err)
      toast.error("Unable to save savings goal. Please check your Firestore security rules.")
    }
  }

  const resetData = async () => {
    if (user && db) {
      try {
        const q = query(collection(db, 'users', user.uid, 'transactions'))
        const snapshot = await getDocs(q)
        const batchPromises = []
        snapshot.forEach((docSnap) => {
          batchPromises.push(deleteDoc(doc(db, 'users', user.uid, 'transactions', docSnap.id)))
        })
        
        const qCommitments = query(collection(db, 'users', user.uid, 'commitments'))
        const snapshotCommitments = await getDocs(qCommitments)
        snapshotCommitments.forEach((docSnap) => {
          batchPromises.push(deleteDoc(doc(db, 'users', user.uid, 'commitments', docSnap.id)))
        })

        const qBills = query(collection(db, 'users', user.uid, 'bills'))
        const snapshotBills = await getDocs(qBills)
        snapshotBills.forEach((docSnap) => {
          batchPromises.push(deleteDoc(doc(db, 'users', user.uid, 'bills', docSnap.id)))
        })

        batchPromises.push(setDoc(doc(db, 'users', user.uid, 'savings', 'goal'), {
          amount: 500,
          frequency: 'monthly',
          currency: 'USD'
        }))

        batchPromises.push(setDoc(doc(db, 'users', user.uid, 'settings', 'config'), {
          currency: 'USD',
          monthlyBudget: 3000,
          language: 'en',
          animationSpeed: 'normal'
        }))

        await Promise.all(batchPromises)
      } catch (err) {
        console.error("Failed to delete Firestore data during reset:", err)
      }
    }
    setTransactions([])
    setBills([])
    setFilters({ type: 'all', category: 'all', sort: 'newest', query: '', range: 'all' })
    setSettings({
      currency: 'USD',
      monthlyBudget: 3000,
      language: 'en',
      animationSpeed: 'normal'
    })
    setSavingsGoal({
      amount: 500,
      frequency: 'monthly',
      currency: 'USD'
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
        savingsGoal,
        updateSavingsGoal,
        setTransactions,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        resetData,
        isLoading,
        rates,
        convertAmount,
        convertToUSD,
        convertCurrency,
        bills,
        commitments: bills,
        setBills,
        addBill,
        addCommitment: addBill,
        updateBill,
        updateCommitment: updateBill,
        deleteBill,
        deleteCommitment: deleteBill,
        toggleBillStatus,
        toggleCommitmentStatus: toggleBillStatus
      }}
    >
      {children}
    </ExpenseContext.Provider>
  )
}

export const useExpenseContext = () => useContext(ExpenseContext)
