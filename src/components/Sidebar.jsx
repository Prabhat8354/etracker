import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Receipt,
  BarChart3,
  User,
  Settings,
  ChevronLeft,
  ChevronRight,
  X,
  Sparkles,
  HelpCircle,
  PiggyBank
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthContext } from '../context/AuthContext.jsx'

const links = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { label: 'Transactions', icon: Receipt, path: '/transactions' },
  { label: 'Analytics', icon: BarChart3, path: '/analytics' },
  { label: 'Savings', icon: PiggyBank, path: '/savings' },
  { label: 'Profile', icon: User, path: '/profile' },
  { label: 'Settings', icon: Settings, path: '/settings' },
]

function Sidebar({ mobileOpen, setMobileOpen }) {
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem('sidebar_collapsed') === 'true'
    } catch {
      return false
    }
  })

  const toggleCollapse = () => {
    const nextCollapsed = !collapsed
    setCollapsed(nextCollapsed)
    try {
      localStorage.setItem('sidebar_collapsed', String(nextCollapsed))
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 80 : 260 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="hidden shrink-0 border-r border-slate-200/40 bg-white/40 backdrop-blur-xl dark:border-white/[0.04] dark:bg-slate-950/40 lg:flex lg:flex-col overflow-hidden h-screen sticky top-0 z-20"
      >
        <SidebarContent collapsed={collapsed} toggleCollapse={toggleCollapse} />
      </motion.aside>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-10 w-full max-w-[260px] border-r border-slate-200/40 bg-white/90 backdrop-blur-xl dark:border-white/[0.04] dark:bg-slate-950/90 shadow-2xl h-full"
            >
              <SidebarContent mobileMode setMobileOpen={setMobileOpen} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}

function SidebarContent({ collapsed, toggleCollapse, mobileMode, setMobileOpen }) {
  const { user } = useAuthContext()
  const profileName = user?.displayName || user?.email?.split('@')[0] || 'User'

  return (
    <div className="flex h-full flex-col justify-between p-5">
      <div className="space-y-6">
        {/* Brand Header */}
        <div className="flex items-center justify-between gap-3 text-slate-900 dark:text-slate-100">
          <div className="flex items-center gap-3.5 overflow-hidden">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white shadow-lg shadow-indigo-500/10">
              <span className="text-lg font-bold tracking-tighter">e</span>
            </div>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.15 }}
                className="whitespace-nowrap"
              >
                <p className="text-[9px] font-black uppercase tracking-[0.25em] text-indigo-600 dark:text-indigo-400">eTracker</p>
                <h1 className="text-sm font-extrabold tracking-tight text-slate-800 dark:text-white leading-none">Studio</h1>
              </motion.div>
            )}
          </div>

          {mobileMode && (
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-slate-50 text-slate-600 transition hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-1 relative">
          {links.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              onClick={() => mobileMode && setMobileOpen(false)}
              className={({ isActive }) =>
                `group relative flex items-center gap-3.5 rounded-xl px-3.5 py-2.5 text-xs font-bold uppercase tracking-wider transition duration-150 ${
                  isActive
                    ? 'text-slate-900 dark:text-white'
                    : 'text-slate-400 hover:text-slate-800 dark:text-slate-500 dark:hover:text-slate-300'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {/* Sliding active indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute inset-0 bg-slate-100 dark:bg-white/[0.04] border-l-2 border-indigo-500 rounded-xl -z-10"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  
                  <link.icon className={`h-4.5 w-4.5 shrink-0 transition-transform duration-150 group-hover:scale-105 ${isActive ? 'text-indigo-500' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-350'}`} />
                  
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.15 }}
                      className="whitespace-nowrap"
                    >
                      {link.label}
                    </motion.span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Bottom section */}
      <div className="space-y-3">
        {/* Advanced Financial Insights box */}
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-slate-200/30 bg-slate-50/20 p-4 dark:border-white/[0.02] dark:bg-slate-900/10"
          >
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Premium Pro</p>
            </div>
            <h2 className="mt-2.5 text-xs font-bold text-slate-800 dark:text-white">Smart Analytics</h2>
            <p className="mt-1 text-[11px] leading-normal text-slate-400 dark:text-slate-500 font-semibold font-semibold">Monitor targets dynamically.</p>
          </motion.div>
        )}

        {/* User profile pill */}
        <div className="pt-2 border-t border-slate-200/40 dark:border-white/[0.04]">
          <div className="flex items-center gap-3 overflow-hidden p-1 rounded-xl hover:bg-slate-50 dark:hover:bg-white/[0.02] transition cursor-pointer">
            {user?.photoURL ? (
              <img src={user.photoURL} alt={profileName} className="h-8 w-8 rounded-lg object-cover border border-slate-200/20 dark:border-white/[0.02] shrink-0" />
            ) : (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-xs font-extrabold text-white shadow-md">
                {profileName.charAt(0).toUpperCase()}
              </div>
            )}
            {!collapsed && (
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-800 dark:text-white truncate">{profileName}</p>
                <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 truncate">{user?.email}</p>
              </div>
            )}
          </div>
        </div>

        {/* Collapsible toggle trigger for desktop */}
        {!mobileMode && (
          <button
            type="button"
            onClick={toggleCollapse}
            className="w-full flex items-center justify-center py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-white/[0.02] text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition duration-150"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider"><ChevronLeft className="h-3.5 w-3.5" /> Collapse</div>}
          </button>
        )}
      </div>
    </div>
  )
}

export default Sidebar
