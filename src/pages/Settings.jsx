import { useState } from 'react'
import toast from 'react-hot-toast'
import { useExpenseContext } from '../context/ExpenseContext.jsx'
import EmptyState from '../components/EmptyState.jsx'

function Settings() {
  const { darkMode, setDarkMode, settings, setSettings, setTransactions, resetData, transactions } = useExpenseContext()
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
    } catch (error) {
      toast.error('Import failed. Check your JSON format.')
    }
  }

  if (!transactions) return <EmptyState loading />

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] border border-slate-200/80 bg-white/80 p-8 shadow-soft backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950/80">
        <p className="text-sm uppercase tracking-[0.35em] text-indigo-600 dark:text-indigo-400">Settings</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-900 dark:text-slate-100">Customize your experience</h1>
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Manage preferences and preserve your financial history.</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.75fr_1fr]">
        <div className="rounded-[2rem] border border-slate-200/80 bg-white/80 p-8 shadow-soft backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950/80">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Display preferences</h2>
          <div className="mt-6 space-y-6">
            <div className="rounded-3xl border border-slate-200/80 bg-slate-50 p-5 dark:border-slate-800/80 dark:bg-slate-900/80">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Dark mode</h3>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Toggle the dashboard theme for any lighting.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setDarkMode(!darkMode)}
                  className="rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/10"
                >
                  {darkMode ? 'Light Mode' : 'Dark Mode'}
                </button>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200/80 bg-slate-50 p-5 dark:border-slate-800/80 dark:bg-slate-900/80">
              <label className="block text-sm font-semibold text-slate-900 dark:text-slate-100">Currency</label>
              <select
                value={settings.currency}
                onChange={(event) => setSettings({ ...settings, currency: event.target.value })}
                className="mt-3 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-slate-700 shadow-sm outline-none transition duration-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-600/20"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="JPY">JPY</option>
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[2rem] border border-slate-200/80 bg-white/80 p-8 shadow-soft backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950/80">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Data management</h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Export, import, or clear your transaction history.</p>
            <div className="mt-6 space-y-4">
              <button
                type="button"
                onClick={handleExport}
                className="w-full rounded-3xl bg-gradient-to-r from-indigo-500 to-violet-500 px-5 py-4 text-sm font-semibold text-white shadow-lg shadow-indigo-500/15 transition hover:scale-[1.01]"
              >
                Export Data as JSON
              </button>
              <div className="rounded-3xl border border-slate-200/80 bg-slate-50 p-4 dark:border-slate-800/80 dark:bg-slate-900/80">
                <label className="block text-sm font-semibold text-slate-900 dark:text-slate-100">Import JSON payload</label>
                <textarea
                  value={importData}
                  onChange={(event) => setImportData(event.target.value)}
                  rows={6}
                  className="mt-3 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm outline-none transition duration-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-600/20"
                  placeholder="Paste your JSON here"
                />
                <button
                  type="button"
                  onClick={handleImport}
                  className="mt-4 w-full rounded-3xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-slate-200"
                >
                  Import JSON
                </button>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Are you sure you want to clear all saved data?')) resetData()
                }}
                className="w-full rounded-3xl border border-rose-300 bg-rose-50 px-5 py-4 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 dark:border-rose-700/30 dark:bg-rose-950/70 dark:text-rose-200"
              >
                Clear All Data
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings
