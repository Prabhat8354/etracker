import { Suspense, lazy, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AnimatePresence, motion } from 'framer-motion'
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
          <div className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-100 to-slate-200 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-900 dark:text-slate-100">
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

  return (
    <div className="flex min-h-screen overflow-hidden">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <div className="flex-1">
        <Navbar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
        <main className="px-4 py-6 sm:px-6 lg:px-8">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="space-y-6"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  )
}

export default App
