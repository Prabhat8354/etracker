import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthContext } from '../context/AuthContext.jsx'
import { useExpenseContext } from '../context/ExpenseContext.jsx'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import { Eye, EyeOff, ShieldCheck, Mail, Lock, User, Sparkles, CheckCircle, Sun, Moon } from 'lucide-react'

function Register() {
  const { signUp, authLoading } = useAuthContext()
  const { darkMode, setDarkMode } = useExpenseContext()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [shakeOnError, setShakeOnError] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!form.name || !form.email || !form.password || !form.confirmPassword) {
      toast.error('All fields are required.')
      setShakeOnError(true)
      setTimeout(() => setShakeOnError(false), 500)
      return
    }
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match.')
      setShakeOnError(true)
      setTimeout(() => setShakeOnError(false), 500)
      return
    }

    try {
      await signUp({ name: form.name.trim(), email: form.email.trim(), password: form.password })
      toast.success('Registration successful. Redirecting...')
      navigate('/dashboard')
    } catch (error) {
      setShakeOnError(true)
      setTimeout(() => setShakeOnError(false), 500)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white relative overflow-hidden flex flex-col justify-center transition-colors duration-200">
      
      {/* Theme Toggle Button - Top Right */}
      <div className="absolute top-6 right-6 z-50">
        <button
          type="button"
          onClick={() => setDarkMode(!darkMode)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 text-slate-600 dark:text-slate-300 shadow-sm transition hover:bg-slate-50 dark:hover:bg-slate-800"
          aria-label="Toggle theme"
        >
          {darkMode ? <Sun className="h-4.5 w-4.5 text-amber-500" /> : <Moon className="h-4.5 w-4.5 text-indigo-500" />}
        </button>
      </div>

      {/* Decorative Blob */}
      <div className="absolute -top-[10%] -left-[10%] h-[40vw] w-[40vw] rounded-full bg-blob-indigo opacity-20 dark:opacity-30 pointer-events-none" />
      <div className="absolute -bottom-[10%] -right-[10%] h-[35vw] w-[35vw] rounded-full bg-blob-purple opacity-10 dark:opacity-20 pointer-events-none" />

      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 relative z-10 flex-1 flex items-center">
        <div className="grid w-full gap-10 lg:grid-cols-2 items-center">
          
          {/* Left Panel: Marketing Overview */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="hidden lg:flex flex-col justify-between p-10 h-full max-w-xl text-left"
          >
            <div>
              <div className="inline-flex items-center gap-2.5 rounded-2xl bg-white/60 dark:bg-white/5 border border-slate-200/50 dark:border-white/10 px-4 py-2.5 text-sm font-bold tracking-tight text-slate-800 dark:text-slate-100/90 shadow-sm backdrop-blur-md">
                <span className="h-7 w-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-extrabold text-sm shadow-md">e</span>
                <span>eTracker Studio</span>
              </div>
              
              <div className="mt-14 space-y-6">
                <h1 className="text-5xl font-extrabold tracking-tight leading-tight text-slate-800 dark:text-white">
                  Start tracking your expenses <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400">privately</span>.
                </h1>
                <p className="text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">
                  Join our premium Workspace to log budgets, generate financial insights, and export your history instantly.
                </p>
              </div>
            </div>

            <div className="mt-14 space-y-4 rounded-3xl border border-slate-200/50 dark:border-white/5 bg-white/40 dark:bg-white/[0.02] p-6 backdrop-blur-md">
              <div className="flex items-start gap-4">
                <div className="mt-0.5 rounded-xl bg-indigo-500/10 p-2 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-200">Secure Database Integration</h4>
                  <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mt-0.5">Your data is stored securely and linked natively to your authenticated profile.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="mt-0.5 rounded-xl bg-emerald-500/10 p-2 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <CheckCircle className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-200">Automated Financial Budgets</h4>
                  <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mt-0.5">Define your targets and track visual charts instantly upon sign up.</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Panel: Glass Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: shakeOnError ? [-10, 10, -10, 10, 0] : 0 }}
            transition={shakeOnError ? { duration: 0.4 } : { duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            className="w-full max-w-md mx-auto rounded-[2.5rem] border border-slate-200/60 dark:border-white/10 bg-white/70 dark:bg-slate-900/40 p-8 shadow-2xl backdrop-blur-xl"
          >
            <div className="mb-6 text-left">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Get started</p>
              <h2 className="text-2xl font-black text-slate-800 dark:text-white mt-1.5">Create account</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Name with Static Label */}
              <div className="space-y-1.5 text-left">
                <label
                  htmlFor="reg-name"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400"
                >
                  Full Name
                </label>
                <input
                  type="text"
                  id="reg-name"
                  value={form.name}
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                  className="w-full rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-sm font-semibold text-slate-900 dark:text-white outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  placeholder="John Doe"
                  required
                />
              </div>

              {/* Email with Static Label */}
              <div className="space-y-1.5 text-left">
                <label
                  htmlFor="reg-email"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="reg-email"
                  value={form.email}
                  onChange={(event) => setForm({ ...form, email: event.target.value })}
                  className="w-full rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-sm font-semibold text-slate-900 dark:text-white outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  placeholder="name@example.com"
                  required
                />
              </div>

              {/* Password with Static Label */}
              <div className="space-y-1.5 text-left relative">
                <label
                  htmlFor="reg-password"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="reg-password"
                    value={form.password}
                    onChange={(event) => setForm({ ...form, password: event.target.value })}
                    className="w-full rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 pl-4 pr-12 py-3 text-sm font-semibold text-slate-900 dark:text-white outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    placeholder="Enter password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-white transition"
                  >
                    {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password with Static Label */}
              <div className="space-y-1.5 text-left relative">
                <label
                  htmlFor="reg-confirm"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="reg-confirm"
                    value={form.confirmPassword}
                    onChange={(event) => setForm({ ...form, confirmPassword: event.target.value })}
                    className="w-full rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 pl-4 pr-12 py-3 text-sm font-semibold text-slate-900 dark:text-white outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    placeholder="Confirm password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-white transition"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={authLoading}
                className="w-full rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-violet-600 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-indigo-500/20 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-75 mt-4"
              >
                {authLoading ? 'Creating account…' : 'Create account'}
              </button>
            </form>

            <p className="mt-8 text-center text-xs font-semibold text-slate-400 dark:text-slate-500">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition ml-1">
                Sign in
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default Register
