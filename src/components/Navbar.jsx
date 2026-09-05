import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Sun,
  Moon,
  Calendar,
  Menu,
  ChevronDown,
  LogOut,
  Settings,
  Bell,
  Search,
  User as UserIcon,
  PiggyBank,
  Receipt,
  Check
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useExpenseContext } from '../context/ExpenseContext.jsx'
import { useAuthContext } from '../context/AuthContext.jsx'
import { useNotificationContext } from '../context/NotificationContext.jsx'
import SearchBar from './SearchBar.jsx'

function Navbar({ mobileOpen, setMobileOpen }) {
  const { darkMode, setDarkMode, filters, setFilters, greeting } = useExpenseContext()
  const { user, logout } = useAuthContext()
  const { inAppNotifications = [], unreadCount = 0, markAllNotificationsRead, clearNotification } = useNotificationContext() || {}
  const [menuOpen, setMenuOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)

  const currentDate = useMemo(
    () => new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
    []
  )
  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Guest'

  return (
    <header className="sticky top-0 z-30 w-full border-b border-slate-200/50 bg-white/75 backdrop-blur-md dark:border-slate-800/50 dark:bg-slate-950/75 transition-colors duration-300">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        
        {/* Left Side: Mobile Menu, Date, Greeting */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/60 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 dark:border-slate-800/60 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 lg:hidden"
            aria-label="Open navigation drawer"
          >
            <Menu className="h-5 w-5" />
          </button>
          
          <div className="hidden sm:inline-flex items-center gap-2 rounded-2xl border border-slate-200/50 bg-slate-100/50 px-3.5 py-2 text-slate-600 dark:border-slate-800/50 dark:bg-slate-900/50 dark:text-slate-300">
            <Calendar className="h-4 w-4 text-indigo-500" />
            <span className="text-xs font-semibold">{currentDate}</span>
          </div>

          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="hidden md:block"
          >
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">{greeting}</p>
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200">Hello, {displayName}</h2>
          </motion.div>
        </div>

        {/* Search Bar - Center */}
        <div className="flex-1 max-w-md mx-4">
          <SearchBar value={filters.query} onChange={(value) => setFilters({ ...filters, query: value })} />
        </div>

        {/* Right Side: Theme Toggle, Notifications, Profile Dropdown */}
        <div className="flex items-center gap-3">
          
          {/* Theme Toggle */}
          <button
            type="button"
            onClick={() => setDarkMode(!darkMode)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/50 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 dark:border-slate-800/50 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            aria-label="Toggle theme"
          >
            {darkMode ? <Sun className="h-4.5 w-4.5 text-amber-500" /> : <Moon className="h-4.5 w-4.5 text-indigo-500" />}
          </button>

          {/* Notifications Bell */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="group relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/50 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 dark:border-slate-800/50 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              aria-label="View notifications"
            >
              <Bell className="h-4.5 w-4.5 group-hover:animate-ring transition-transform" />
              {/* Dynamic Notification Badge */}
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                </span>
              )}
            </button>

            <AnimatePresence>
              {notificationsOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setNotificationsOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 z-20 mt-2.5 w-80 rounded-2xl border border-slate-200/50 bg-white/95 p-4 shadow-xl backdrop-blur-md dark:border-slate-800/50 dark:bg-slate-950/95"
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2 dark:border-slate-800">
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Notifications</h3>
                        {unreadCount > 0 && (
                          <span className="rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.2 text-[9px] font-bold">
                            {unreadCount} new
                          </span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <button
                          type="button"
                          onClick={markAllNotificationsRead}
                          className="text-[10px] font-bold text-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                    
                    <div className="mt-3 space-y-2 max-h-72 overflow-y-auto pr-1">
                      {inAppNotifications.length === 0 ? (
                        <div className="py-6 text-center">
                          <Bell className="mx-auto h-6 w-6 text-slate-300 dark:text-slate-600 mb-1" />
                          <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">No notifications yet</p>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">You're all caught up with your bills and savings!</p>
                        </div>
                      ) : (
                        inAppNotifications.slice(0, 8).map((item) => (
                          <div
                            key={item.id}
                            className={`text-xs p-2.5 rounded-xl border transition-colors ${
                              item.read
                                ? 'bg-slate-50/50 dark:bg-slate-900/30 border-transparent text-slate-600 dark:text-slate-400'
                                : 'bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-100 dark:border-indigo-900/30 text-slate-800 dark:text-slate-200'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-start gap-2">
                                {item.type === 'bill' && <Calendar className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />}
                                {item.type === 'savings' && <PiggyBank className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />}
                                {item.type === 'transaction' && <Receipt className="h-4 w-4 text-purple-500 mt-0.5 shrink-0" />}
                                {(!item.type || item.type === 'test') && <Bell className="h-4 w-4 text-indigo-500 mt-0.5 shrink-0" />}
                                <div>
                                  <p className="font-semibold leading-tight">{item.title}</p>
                                  <p className="mt-0.5 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">{item.body}</p>
                                </div>
                              </div>
                              {!item.read && (
                                <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 shrink-0 mt-1" />
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 text-center">
                      <Link
                        to="/settings"
                        onClick={() => setNotificationsOpen(false)}
                        className="text-[10px] font-bold uppercase tracking-wider text-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400"
                      >
                        Notification Settings →
                      </Link>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              className="flex items-center gap-2.5 rounded-xl border border-slate-200/50 bg-white/80 p-1.5 text-sm text-slate-700 shadow-sm transition hover:border-slate-300 dark:border-slate-800/50 dark:bg-slate-900/80 dark:text-slate-100"
            >
              {user?.photoURL ? (
                <img src={user.photoURL} alt={displayName} className="h-7 w-7 rounded-lg object-cover" />
              ) : (
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-xs font-bold text-white shadow-glow">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="hidden sm:inline font-semibold pr-1">{displayName}</span>
              <ChevronDown className={`h-4.5 w-4.5 text-slate-400 transition-transform duration-200 ${menuOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 z-20 mt-2.5 w-52 rounded-2xl border border-slate-200/50 bg-white/95 p-1.5 shadow-xl backdrop-blur-md dark:border-slate-800/50 dark:bg-slate-950/95"
                  >
                    <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 mb-1.5">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Signed in as</p>
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{user?.email}</p>
                    </div>
                    
                    <Link
                      to="/profile"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition dark:text-slate-300 dark:hover:bg-slate-900"
                    >
                      <UserIcon className="h-4 w-4 text-slate-400" />
                      My Profile
                    </Link>
                    <Link
                      to="/settings"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition dark:text-slate-300 dark:hover:bg-slate-900"
                    >
                      <Settings className="h-4 w-4 text-slate-400" />
                      Settings
                    </Link>
                    <button
                      type="button"
                      onClick={async () => {
                        await logout()
                        setMenuOpen(false)
                      }}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition dark:text-rose-400 dark:hover:bg-rose-950/20"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>
    </header>
  )
}

export default Navbar
