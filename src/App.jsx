import { Suspense, lazy, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useLocation, NavLink } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AnimatePresence, motion, useScroll, useSpring } from 'framer-motion'
import { LayoutDashboard, Receipt, BarChart3, User, Settings as SettingsIcon, PiggyBank } from 'lucide-react'
import { AuthProvider } from './context/AuthContext.jsx'
import { ExpenseProvider } from './context/ExpenseContext.jsx'
import Sidebar from './components/Sidebar.jsx'
import Navbar from './components/Navbar.jsx'
import Loader from './components/Loader.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import PublicRoute from './components/PublicRoute.jsx'
import FirebaseConfigErrorPage from './components/FirebaseConfigError.jsx'
import { firebaseError, isFirebaseConfigured, missingEnvVars } from './firebase/firebaseConfig.js'

const Dashboard = lazy(() => import('./pages/Dashboard.jsx'))
const Transactions = lazy(() => import('./pages/Transactions.jsx'))
const Analytics = lazy(() => import('./pages/Analytics.jsx'))
const Settings = lazy(() => import('./pages/Settings.jsx'))
const Profile = lazy(() => import('./pages/Profile.jsx'))
const Savings = lazy(() => import('./pages/Savings.jsx'))
const Login = lazy(() => import('./pages/Login.jsx'))
const Register = lazy(() => import('./pages/Register.jsx'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword.jsx'))

function App() {
  const [mobileOpen, setMobileOpen] = useState(false)

  if (!isFirebaseConfigured) {
    return <FirebaseConfigErrorPage missingEnvVars={missingEnvVars} errorMessage={firebaseError} />
  }

  return (
    <AuthProvider>
      <ExpenseProvider>
        <Router>
          <div className="min-h-screen bg-slate-50 dark:bg-surface-dark text-slate-900 dark:text-slate-100 relative overflow-hidden transition-colors duration-500">
            {/* Ambient Background Blobs */}
            <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
              <div className="absolute -top-[10%] -left-[10%] h-[50vw] w-[50vw] rounded-full bg-blob-indigo animate-float opacity-70 dark:opacity-40" />
              <div className="absolute top-[40%] -right-[10%] h-[45vw] w-[45vw] rounded-full bg-blob-purple animate-float opacity-60 dark:opacity-30 [animation-delay:4s]" />
              <div className="absolute -bottom-[10%] left-[20%] h-[40vw] w-[40vw] rounded-full bg-blob-pink animate-float opacity-50 dark:opacity-20 [animation-delay:8s]" />
            </div>

            <AnimatePresence mode="wait">
              <Routes>
                <Route
                  path="/login"
                  element={
                    <PublicRoute>
                      <Suspense fallback={<Loader />}>
                        <Login />
                      </Suspense>
                    </PublicRoute>
                  }
                />
                <Route
                  path="/register"
                  element={
                    <PublicRoute>
                      <Suspense fallback={<Loader />}>
                        <Register />
                      </Suspense>
                    </PublicRoute>
                  }
                />
                <Route
                  path="/forgot-password"
                  element={
                    <PublicRoute>
                      <Suspense fallback={<Loader />}>
                        <ForgotPassword />
                      </Suspense>
                    </PublicRoute>
                  }
                />
                <Route element={<ProtectedRoute />}>
                  <Route element={<AppLayout mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />}>
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route
                      path="/dashboard"
                      element={
                        <Suspense fallback={<Loader />}>
                          <Dashboard />
                        </Suspense>
                      }
                    />
                    <Route
                      path="/transactions"
                      element={
                        <Suspense fallback={<Loader />}>
                          <Transactions />
                        </Suspense>
                      }
                    />
                    <Route
                      path="/analytics"
                      element={
                        <Suspense fallback={<Loader />}>
                          <Analytics />
                        </Suspense>
                      }
                    />
                    <Route
                      path="/savings"
                      element={
                        <Suspense fallback={<Loader />}>
                          <Savings />
                        </Suspense>
                      }
                    />
                    <Route
                      path="/profile"
                      element={
                        <Suspense fallback={<Loader />}>
                          <Profile />
                        </Suspense>
                      }
                    />
                    <Route
                      path="/settings"
                      element={
                        <Suspense fallback={<Loader />}>
                          <Settings />
                        </Suspense>
                      }
                    />
                    <Route path="*" element={<Loader notFound />} />
                  </Route>
                </Route>
              </Routes>
            </AnimatePresence>
          </div>
          <Toaster position="top-right" toastOptions={{ duration: 2800 }} />
        </Router>
      </ExpenseProvider>
    </AuthProvider>
  )
}

function AppLayout({ mobileOpen, setMobileOpen }) {
  const location = useLocation()
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  })

  const mobileNavLinks = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'Transactions', icon: Receipt, path: '/transactions' },
    { label: 'Analytics', icon: BarChart3, path: '/analytics' },
    { label: 'Savings', icon: PiggyBank, path: '/savings' },
    { label: 'Profile', icon: User, path: '/profile' },
    { label: 'Settings', icon: SettingsIcon, path: '/settings' },
  ]

  return (
    <div className="relative flex min-h-screen overflow-hidden z-10">
      {/* Scroll Progress Bar */}
      <motion.div
        id="scroll-progress"
        className="fixed top-0 left-0 right-0 z-50 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
        style={{ scaleX }}
      />
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 overflow-y-auto">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-6 max-w-7xl mx-auto pb-20 lg:pb-0"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/80 dark:bg-slate-950/80 backdrop-blur-lg border-t border-slate-200/40 dark:border-white/[0.04] py-2 lg:hidden flex justify-around items-center">
        {mobileNavLinks.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 text-[9px] font-bold uppercase tracking-wider transition ${
                isActive ? 'text-indigo-500 font-extrabold' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-400'
              }`
            }
          >
            <link.icon className="h-5 w-5" />
            <span>{link.label}</span>
          </NavLink>
        ))}
      </div>
    </div>
  )
}

export default App
