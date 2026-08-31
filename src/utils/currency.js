export const convertCurrency = (amount, fromCurrency, toCurrency, rates = {}) => {
  if (!fromCurrency || !toCurrency || fromCurrency === toCurrency) return Number(amount)
  const fromRate = rates[fromCurrency] || 1
  const toRate = rates[toCurrency] || 1
  const amountInUSD = Number(amount) / fromRate
  return amountInUSD * toRate
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
