import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { FiMoon, FiSun, FiCalendar, FiMenu, FiChevronDown, FiLogOut, FiUser, FiSettings } from 'react-icons/fi'
import { useExpenseContext } from '../context/ExpenseContext.jsx'
import { useAuthContext } from '../context/AuthContext.jsx'
import SearchBar from './SearchBar.jsx'

function Navbar({ mobileOpen, setMobileOpen }) {
  const { darkMode, setDarkMode, filters, setFilters } = useExpenseContext()
  const { user, logout } = useAuthContext()
  const [menuOpen, setMenuOpen] = useState(false)

  const currentDate = useMemo(() => new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }), [])
  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Guest'

  return (
    <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950/80">
      <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <div className="inline-flex items-center justify-center rounded-3xl bg-slate-100 px-4 py-3 text-slate-600 shadow-sm dark:bg-slate-900 dark:text-slate-300 lg:hidden">
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="inline-flex items-center justify-center rounded-full p-2 text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-800"
              aria-label="Open navigation drawer"
            >
              <FiMenu className="h-5 w-5" />
            </button>
          </div>
          <div className="inline-flex items-center gap-3 rounded-3xl bg-slate-100 px-4 py-3 text-slate-600 shadow-sm dark:bg-slate-900 dark:text-slate-300">
            <FiCalendar className="h-5 w-5" />
            <span className="text-sm font-medium">{currentDate}</span>
          </div>
          <SearchBar value={filters.query} onChange={(value) => setFilters({ ...filters, query: value })} />
        </div>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setDarkMode(!darkMode)}
            className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-600 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-200 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            aria-label="Toggle dark mode"
          >
            {darkMode ? <FiSun className="h-5 w-5" /> : <FiMoon className="h-5 w-5" />}
          </button>
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              className="flex items-center gap-3 rounded-full border border-slate-200/80 bg-white/80 px-4 py-2 text-sm text-slate-700 shadow-sm transition hover:border-slate-300 dark:border-slate-800/80 dark:bg-slate-900/80 dark:text-slate-100"
            >
              <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-base font-semibold text-white shadow-glow">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <div className="text-left">
                <p className="text-[11px] uppercase tracking-[0.32em] text-slate-400">Account</p>
                <p className="font-semibold">{displayName}</p>
              </div>
              <FiChevronDown className={`h-4 w-4 transition ${menuOpen ? 'rotate-180' : ''}`} />
            </button>
            {menuOpen && (
              <div className="absolute right-0 z-20 mt-3 w-52 rounded-[1.5rem] border border-slate-200/80 bg-white py-2 shadow-2xl shadow-slate-900/5 dark:border-slate-800/80 dark:bg-slate-950">
                <Link
                  to="/settings"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-3 text-sm text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-900"
                >
                  <FiSettings className="h-4 w-4" />
                  Settings
                </Link>
                <button
                  type="button"
                  onClick={async () => {
                    await logout()
                    setMenuOpen(false)
                  }}
                  className="flex w-full items-center gap-2 px-4 py-3 text-sm text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-900"
                >
                  <FiLogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Navbar
