import { useState } from 'react'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import {
  Settings as SettingsIcon,
  Sun,
  Moon,
  Database,
  Download,
  Upload,
  Trash2,
  Coins,
  Sparkles,
  Globe,
  Gauge,
  Bell,
  Target,
  Clock
} from 'lucide-react'
import { useExpenseContext } from '../context/ExpenseContext.jsx'
import EmptyState from '../components/EmptyState.jsx'

function Settings() {
  const { darkMode, setDarkMode, settings, setSettings, setTransactions, resetData, transactions, savingsGoal, updateSavingsGoal } = useExpenseContext()
  const [importData, setImportData] = useState('')

  const handleExport = () => {
    const data = JSON.stringify({ transactions, settings, darkMode }, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'etracker-backup.json'
    link.click()
    URL.revokeObjectURL(url)
    toast.success('Exported settings and transactions successfully')
  }

  const handleImport = () => {
    try {
      const parsed = JSON.parse(importData)
      if (!parsed.transactions || !Array.isArray(parsed.transactions)) throw new Error('Invalid file format')
      setTransactions(parsed.transactions)
      setSettings(parsed.settings || settings)
      setDarkMode(parsed.darkMode ?? darkMode)
      toast.success('Import completed successfully')
      setImportData('')
    } catch (error) {
      toast.error('Import failed. Check your JSON format.')
    }
  }

  const updateSetting = (key, value) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value
    }))
    toast.success(`Updated ${key} preference`)
  }

  if (!transactions) return <EmptyState loading />

  return (
    <div className="space-y-6 pb-10">
      
      {/* Title Header Card */}
      <section className="rounded-3xl border border-slate-200/30 bg-white/60 p-8 shadow-soft backdrop-blur-md dark:border-white/[0.02] dark:bg-slate-950/40 relative overflow-hidden">
        <div className="absolute -top-16 -right-16 h-36 w-36 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none" />
        <div className="flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
          <p className="text-[9px] font-black uppercase tracking-[0.25em] text-indigo-600 dark:text-indigo-400">System Preferences</p>
        </div>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white leading-tight">
          System Settings
        </h1>
        <p className="mt-2 text-xs font-semibold text-slate-400 dark:text-slate-500 max-w-xl leading-relaxed">
          Manage system configurations, currencies conversion, targets limits, and data backups.
        </p>
      </section>

      {/* Settings Grid */}
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        
        {/* Left Side: General Preferences */}
        <div className="rounded-3xl border border-slate-200/30 bg-white/60 p-8 shadow-soft backdrop-blur-md dark:border-white/[0.02] dark:bg-slate-950/40 space-y-6">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-800 dark:text-white">Workspace Preferences</h2>
            <p className="mt-1 text-xs font-semibold text-slate-400 dark:text-slate-500">
              Customize language, appearance themes, and exchange currencies.
            </p>
          </div>

          <div className="space-y-4">
            
            {/* Theme Switch Toggle */}
            <div className="rounded-2xl border border-slate-200/30 bg-white/40 p-4.5 dark:border-white/[0.02] dark:bg-slate-900/10 flex items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                {darkMode ? (
                  <Moon className="h-5 w-5 text-indigo-500 mt-0.5" />
                ) : (
                  <Sun className="h-5 w-5 text-amber-500 mt-0.5" />
                )}
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">Appearance theme</h3>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Toggle light or dark mode theme styling.</p>
                </div>
              </div>
              
              <button
                type="button"
                onClick={() => setDarkMode(!darkMode)}
                className={`relative inline-flex h-6.5 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-indigo-500/10 ${
                  darkMode ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-800'
                }`}
                aria-label="Toggle dark mode"
              >
                <span
                  className={`pointer-events-none inline-block h-5.5 w-5.5 transform rounded-full bg-white shadow-md ring-0 transition duration-300 ease-in-out ${
                    darkMode ? 'translate-x-5.5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Currency Selector */}
            <div className="rounded-2xl border border-slate-200/30 bg-white/40 p-4.5 dark:border-white/[0.02] dark:bg-slate-900/10 space-y-2.5">
              <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                <Coins className="h-4 w-4 text-emerald-500" />
                Global currency
              </label>
              <select
                value={settings.currency || 'USD'}
                onChange={(event) => updateSetting('currency', event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-750 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:focus:border-indigo-400"
              >
                <option value="USD">USD ($) US Dollar</option>
                <option value="INR">INR (₹) Indian Rupee</option>
                <option value="EUR">EUR (€) Euro</option>
                <option value="GBP">GBP (£) British Pound</option>
                <option value="JPY">JPY (¥) Japanese Yen</option>
                <option value="CAD">CAD (C$) Canadian Dollar</option>
                <option value="AUD">AUD (A$) Australian Dollar</option>
                <option value="AED">AED UAE Dirham</option>
                <option value="SAR">SAR Saudi Riyal</option>
                <option value="SGD">SGD Singapore Dollar</option>
              </select>
            </div>

            {/* Language Selector */}
            <div className="rounded-2xl border border-slate-200/30 bg-white/40 p-4.5 dark:border-white/[0.02] dark:bg-slate-900/10 space-y-2.5">
              <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                <Globe className="h-4 w-4 text-indigo-500" />
                Language
              </label>
              <select
                value={settings.language || 'en'}
                onChange={(event) => updateSetting('language', event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-750 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:focus:border-indigo-400"
              >
                <option value="en">English</option>
                <option value="hi">Hindi (हिन्दी)</option>
                <option value="es">Spanish (Español)</option>
                <option value="fr">French (Français)</option>
              </select>
            </div>

            {/* Animation Speed */}
            <div className="rounded-2xl border border-slate-200/30 bg-white/40 p-4.5 dark:border-white/[0.02] dark:bg-slate-900/10 space-y-2.5">
              <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                <Gauge className="h-4 w-4 text-purple-500" />
                Animation Speed
              </label>
              <select
                value={settings.animationSpeed || 'normal'}
                onChange={(event) => updateSetting('animationSpeed', event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-750 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:focus:border-indigo-400"
              >
                <option value="fast">Fast</option>
                <option value="normal">Normal</option>
                <option value="slow">Slow</option>
              </select>
            </div>

            {/* Notifications Toggle */}
            <div className="rounded-2xl border border-slate-200/30 bg-white/40 p-4.5 dark:border-white/[0.02] dark:bg-slate-900/10 flex items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <Bell className="h-5 w-5 text-amber-500 mt-0.5" />
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">Push notifications</h3>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Toggle alert logs and updates.</p>
                </div>
              </div>
              
              <button
                type="button"
                onClick={() => updateSetting('notificationsEnabled', !(settings.notificationsEnabled ?? true))}
                className={`relative inline-flex h-6.5 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-indigo-500/10 ${
                  (settings.notificationsEnabled ?? true) ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-800'
                }`}
                aria-label="Toggle notifications"
              >
                <span
                  className={`pointer-events-none inline-block h-5.5 w-5.5 transform rounded-full bg-white shadow-md ring-0 transition duration-300 ease-in-out ${
                    (settings.notificationsEnabled ?? true) ? 'translate-x-5.5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

          </div>
        </div>

        {/* Right Side: Targets & Data backups */}
        <div className="rounded-3xl border border-slate-200/30 bg-white/60 p-8 shadow-soft backdrop-blur-md dark:border-white/[0.02] dark:bg-slate-950/40 space-y-6">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-800 dark:text-white">Targets & Database</h2>
            <p className="mt-1 text-xs font-semibold text-slate-400 dark:text-slate-500">
              Manage limits, savings goals, and data backup tools.
            </p>
          </div>

          <div className="space-y-4">
            
            {/* Savings Goal Input */}
            <div className="rounded-2xl border border-slate-200/30 bg-white/40 p-4.5 dark:border-white/[0.02] dark:bg-slate-900/10 space-y-2.5">
              <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                <Target className="h-4 w-4 text-rose-500" />
                Savings Goal Target
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={savingsGoal.amount}
                  onChange={(event) => updateSavingsGoal({ ...savingsGoal, amount: Number(event.target.value) })}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-xs font-semibold text-slate-900 dark:text-white outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 dark:focus:border-indigo-400"
                  placeholder="e.g. 500"
                  min="0"
                />
                <select
                  value={savingsGoal.currency || 'USD'}
                  onChange={(event) => updateSavingsGoal({ ...savingsGoal, currency: event.target.value })}
                  className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-2.5 text-xs font-semibold text-slate-900 dark:text-white outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 dark:focus:border-indigo-400"
                >
                  <option value="USD">USD</option>
                  <option value="INR">INR</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="JPY">JPY</option>
                  <option value="CAD">CAD</option>
                  <option value="AUD">AUD</option>
                  <option value="AED">AED</option>
                  <option value="SAR">SAR</option>
                  <option value="SGD">SGD</option>
                </select>
              </div>
            </div>

            {/* Savings Goal Period */}
            <div className="rounded-2xl border border-slate-200/30 bg-white/40 p-4.5 dark:border-white/[0.02] dark:bg-slate-900/10 space-y-2.5">
              <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                <Clock className="h-4 w-4 text-purple-500" />
                Savings Goal Period
              </label>
              <select
                value={savingsGoal.frequency || 'monthly'}
                onChange={(event) => updateSavingsGoal({ ...savingsGoal, frequency: event.target.value })}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-xs font-semibold text-slate-900 dark:text-white outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 dark:focus:border-indigo-400"
              >
                <option value="daily">Daily Goal</option>
                <option value="weekly">Weekly Goal</option>
                <option value="monthly">Monthly Goal</option>
                <option value="yearly">Yearly Goal</option>
              </select>
            </div>

            {/* Monthly Budget limit */}
            <div className="rounded-2xl border border-slate-200/30 bg-white/40 p-4.5 dark:border-white/[0.02] dark:bg-slate-900/10 space-y-2.5">
              <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                <Target className="h-4 w-4 text-indigo-500" />
                Monthly Budget Limit
              </label>
              <input
                type="number"
                value={settings.monthlyBudget ?? 3000}
                onChange={(event) => setSettings(prev => ({ ...prev, monthlyBudget: Number(event.target.value) }))}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-xs font-semibold text-slate-900 dark:text-white outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 dark:focus:border-indigo-400"
                placeholder="e.g. 3000"
                min="0"
              />
            </div>

            {/* Export data */}
            <motion.button
              type="button"
              onClick={handleExport}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-md hover:brightness-105"
            >
              <Download className="h-4 w-4" />
              Export data backup JSON
            </motion.button>

            {/* Import JSON Form */}
            <div className="rounded-2xl border border-slate-200/30 bg-white/40 p-4.5 dark:border-white/[0.02] dark:bg-slate-900/10">
              <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                <Database className="h-4 w-4 text-indigo-500" />
                Import JSON backup payload
              </label>
              
              <textarea
                value={importData}
                onChange={(event) => setImportData(event.target.value)}
                rows={4}
                className="mt-3 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 dark:focus:border-indigo-400 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                placeholder="Paste backup JSON details here..."
              />
              
              <motion.button
                type="button"
                onClick={handleImport}
                whileHover={{ scale: 1.015 }}
                whileTap={{ scale: 0.985 }}
                className="mt-3.5 w-full flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-slate-200 transition"
              >
                <Upload className="h-4 w-4" />
                Upload JSON Backup
              </motion.button>
            </div>

            {/* Clear Zone */}
            <div className="rounded-2xl border border-rose-200/50 bg-rose-50/10 p-4.5 dark:border-rose-900/20 dark:bg-rose-950/5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h4 className="text-xs font-bold text-rose-600 dark:text-rose-400">Danger Zone</h4>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Wipes out local transaction lists and settings.</p>
              </div>
              <motion.button
                type="button"
                onClick={() => {
                  if (window.confirm('Are you sure you want to clear all saved data? This cannot be undone.')) resetData()
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="rounded-xl bg-rose-500 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-rose-500/10 transition hover:bg-rose-600 shrink-0"
              >
                <Trash2 className="h-4 w-4 inline mr-1.5" />
                Clear All Data
              </motion.button>
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}

export default Settings
