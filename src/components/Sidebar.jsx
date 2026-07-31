import { NavLink } from 'react-router-dom'
import { FiBarChart2, FiHome, FiSettings, FiList, FiUser, FiX } from 'react-icons/fi'
import { motion } from 'framer-motion'

const links = [
  { label: 'Dashboard', icon: FiHome, path: '/dashboard' },
  { label: 'Transactions', icon: FiList, path: '/transactions' },
  { label: 'Analytics', icon: FiBarChart2, path: '/analytics' },
  { label: 'Profile', icon: FiUser, path: '/profile' },
  { label: 'Settings', icon: FiSettings, path: '/settings' },
]

function Sidebar({ mobileOpen, setMobileOpen }) {
  return (
    <>
      <motion.aside
        initial={{ opacity: 0, x: -24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="hidden w-72 shrink-0 border-r border-slate-200/80 bg-white/70 backdrop-blur-xl dark:border-slate-800/70 dark:bg-slate-950/80 lg:flex lg:flex-col"
      >
        <SidebarContent />
      </motion.aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="relative z-10 w-full max-w-xs border-r border-slate-200/80 bg-white/90 backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950/90"
          >
            <SidebarContent mobileMode setMobileOpen={setMobileOpen} />
          </motion.div>
        </div>
      )}
    </>
  )
}

function SidebarContent({ mobileMode, setMobileOpen }) {
  return (
    <div className="flex h-full flex-col justify-between px-6 py-8">
      <div>
        <div className="mb-10 flex items-center justify-between gap-3 text-slate-900 dark:text-slate-100">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-glow">
              <span className="text-xl font-semibold">e</span>
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">eTracker</p>
              <h1 className="text-xl font-semibold">Expense Studio</h1>
            </div>
          </div>
          {mobileMode && (
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition hover:bg-slate-200 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <FiX className="h-5 w-5" />
            </button>
          )}
        </div>
        <nav className="space-y-2">
          {links.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              onClick={() => mobileMode && setMobileOpen(false)}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-3xl px-4 py-3 text-sm font-medium transition duration-300 ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-soft dark:bg-slate-700'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900/80 dark:hover:text-white'
                }`
              }
            >
              <link.icon className="h-5 w-5" />
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>
      <div className="rounded-3xl border border-slate-200/80 bg-slate-50 p-5 text-slate-700 shadow-glow dark:border-slate-800/80 dark:bg-slate-900/80 dark:text-slate-200">
        <p className="text-sm uppercase tracking-[0.25em] text-slate-400 dark:text-slate-500">Need help?</p>
        <h2 className="mt-3 text-lg font-semibold">Advanced financial insights</h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Use analytics to identify the next budget opportunity.</p>
      </div>
    </div>
  )
}

export default Sidebar
