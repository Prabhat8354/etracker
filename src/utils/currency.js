export const DEFAULT_CURRENCY = 'INR'

export const SUPPORTED_CURRENCIES = [
  { code: 'INR', symbol: '₹', label: 'INR (₹) Indian Rupee' },
  { code: 'USD', symbol: '$', label: 'USD ($) US Dollar' },
  { code: 'EUR', symbol: '€', label: 'EUR (€) Euro' },
  { code: 'GBP', symbol: '£', label: 'GBP (£) British Pound' },
  { code: 'JPY', symbol: '¥', label: 'JPY (¥) Japanese Yen' },
  { code: 'AED', symbol: 'د.إ', label: 'AED (د.إ) UAE Dirham' },
  { code: 'CAD', symbol: 'C$', label: 'CAD ($) Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', label: 'AUD ($) Australian Dollar' },
  { code: 'SAR', symbol: 'SR', label: 'SAR (SR) Saudi Riyal' },
  { code: 'SGD', symbol: 'S$', label: 'SGD (S$) Singapore Dollar' },
]

export const CURRENCY_SYMBOLS = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  AED: 'د.إ ',
  CAD: 'C$',
  AUD: 'A$',
  SAR: 'SR ',
  SGD: 'S$'
}

export const canConvert = (fromCurrency, toCurrency, rates = {}) => {
  if (!fromCurrency || !toCurrency) return false
  if (fromCurrency === toCurrency) return true
  const safeRates = rates || {}
  const fromRate = safeRates[fromCurrency]
  const toRate = safeRates[toCurrency]
  return typeof fromRate === 'number' && fromRate > 0 && typeof toRate === 'number' && toRate > 0
}

export const convertCurrency = (amount, fromCurrency, toCurrency, rates = {}) => {
  if (!fromCurrency || !toCurrency || fromCurrency === toCurrency) return Number(amount)
  const safeRates = rates || {}
  const fromRate = safeRates[fromCurrency]
  const toRate = safeRates[toCurrency]
  // If reliable exchange rates are not available, return original amount rather than inventing a conversion
  if (!fromRate || !toRate || fromRate <= 0 || toRate <= 0) {
    return Number(amount)
  }
  const amountInUSD = Number(amount) / fromRate
  return amountInUSD * toRate
}

export const formatCurrency = (value, currency = DEFAULT_CURRENCY) => {
  const symbol = CURRENCY_SYMBOLS[currency] || (currency === 'unknown' ? '' : `${currency} `)
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value)
  return `${symbol}${formatted}`
}
