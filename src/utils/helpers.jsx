export const loadFromStorage = (key) => {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : null
  } catch (error) {
    console.error('Storage read failed', error)
    return null
  }
}

export const saveToStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error('Storage save failed', error)
  }
}

export const calculateSummary = (transactions) => {
  const income = transactions.filter((item) => item.type === 'income').reduce((sum, item) => sum + item.amount, 0)
  const expense = transactions.filter((item) => item.type === 'expense').reduce((sum, item) => sum + item.amount, 0)
  const balance = income - expense
  const savings = Math.max(0, balance * 0.22)
  const incomeChange = income ? 12 : 0
  const expenseChange = expense ? -8 : 0

  return {
    income,
    expense,
    balance,
    savings,
    incomeChange,
    expenseChange,
  }
}

export const formatCurrency = (value, currency = 'USD') => {
  const symbols = {
    USD: '$',
    INR: '₹',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    CAD: 'C$',
    AUD: 'A$',
    AED: 'AED ',
    SAR: 'SR ',
    SGD: 'S$'
  }
  const symbol = symbols[currency] || '$'
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value)
  return `${symbol}${formatted}`
}

export const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

export const generateGreeting = () => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good Morning'
  if (hour < 18) return 'Good Afternoon'
  return 'Good Evening'
}

export const getCategoryColor = (category) => {
  const palette = {
    Salary: 'from-emerald-500 to-teal-400',
    Freelance: 'from-violet-500 to-fuchsia-500',
    Investments: 'from-sky-500 to-cyan-500',
    Groceries: 'from-amber-500 to-orange-500',
    Utilities: 'from-slate-500 to-slate-400',
    Health: 'from-rose-500 to-pink-500',
    Travel: 'from-indigo-500 to-blue-500',
    Entertainment: 'from-fuchsia-500 to-pink-500',
    Shopping: 'from-lime-500 to-emerald-400',
  }
  return palette[category] || 'from-slate-500 to-slate-400'
}

export const getCategoryIcon = (category) => {
  const mapping = {
    Salary: 'MdAttachMoney',
    Freelance: 'MdLaptopMac',
    Investments: 'MdTrendingUp',
    Groceries: 'MdShoppingCart',
    Utilities: 'MdFlashOn',
    Health: 'MdHealthAndSafety',
    Travel: 'MdFlight',
    Entertainment: 'MdMovie',
    Shopping: 'MdCardGiftcard',
  }
  return mapping[category] || 'MdCategory'
}
