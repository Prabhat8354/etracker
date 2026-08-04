import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthContext } from '../context/AuthContext.jsx'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import { Eye, EyeOff, ShieldCheck, Mail, Lock, Sparkles, CheckCircle } from 'lucide-react'

function Login() {
  const { login, googleSignIn, authLoading } = useAuthContext()
  const [form, setForm] = useState({ email: '', password: '', remember: true })
  const [showPassword, setShowPassword] = useState(false)
  const [shakeOnError, setShakeOnError] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!form.email || !form.password) {
      toast.error('Email and password are required.')
      setShakeOnError(true)
      setTimeout(() => setShakeOnError(false), 500)
      return
    }
    try {
      await login(form)
      navigate('/dashboard')
    } catch (error) {
      setShakeOnError(true)
      setTimeout(() => setShakeOnError(false), 500)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden flex flex-col justify-center">
      {/* Decorative Blob */}
      <div className="absolute -top-[10%] -left-[10%] h-[40vw] w-[40vw] rounded-full bg-blob-indigo opacity-30 pointer-events-none" />
      <div className="absolute -bottom-[10%] -right-[10%] h-[35vw] w-[35vw] rounded-full bg-blob-purple opacity-20 pointer-events-none" />

      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 relative z-10 flex-1 flex items-center">
        <div className="grid w-full gap-10 lg:grid-cols-2 items-center">
          
          {/* Left Panel: Marketing Overview */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="hidden lg:flex flex-col justify-between p-10 h-full max-w-xl"
          >
            <div>
              <div className="inline-flex items-center gap-2.5 rounded-2xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm font-bold tracking-tight text-slate-100/90 shadow-lg backdrop-blur-md">
                <span className="h-7 w-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-650 flex items-center justify-center text-white font-extrabold text-sm shadow-md">e</span>
                <span>eTracker Studio</span>
              </div>
              
              <div className="mt-14 space-y-6">
                <h1 className="text-5xl font-extrabold tracking-tight leading-tight">
                  Bring your financial <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">future</span> into focus.
                </h1>
                <p className="text-slate-400 font-semibold leading-relaxed">
                  Experience per-user safe persistence, intelligent categories, and premium real-time analytics – powered by Firebase Auth.
                </p>
              </div>
            </div>

            <div className="mt-14 space-y-4 rounded-3xl border border-white/5 bg-white/[0.02] p-6 backdrop-blur-md">
              <div className="flex items-start gap-4">
                <div className="mt-0.5 rounded-xl bg-indigo-500/10 p-2 text-indigo-400 border border-indigo-500/20">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-200">Firebase Encrypted Auth</h4>
                  <p className="text-xs font-semibold text-slate-400 mt-0.5">Secure, state-preserving login mechanisms for modern budgets.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="mt-0.5 rounded-xl bg-emerald-500/10 p-2 text-emerald-400 border border-emerald-500/20">
                  <CheckCircle className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-200">Personalized Workspace</h4>
                  <p className="text-xs font-semibold text-slate-400 mt-0.5">Encapsulated transactions lists ensuring private financial data records.</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Panel: Glass Login Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={shakeOnError ? { x: [-10, 10, -10, 10, 0] } : { x: 0 }}
            transition={shakeOnError ? { duration: 0.4 } : { duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            className="w-full max-w-md mx-auto rounded-[2.5rem] border border-white/10 bg-slate-900/40 p-8 shadow-2xl backdrop-blur-xl"
          >
            <div className="mb-8">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-550">Welcome back</p>
              <h2 className="text-2xl font-black text-white mt-1.5">Sign in to eTracker</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Email with Floating Label */}
              <div className="relative">
                <input
                  type="email"
                  id="login-email"
                  value={form.email}
                  onChange={(event) => setForm({ ...form, email: event.target.value })}
                  className="peer w-full rounded-2xl border border-white/10 bg-black/40 px-4 pt-6 pb-2 text-sm font-semibold text-white outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 placeholder-transparent"
                  placeholder="Email"
                  required
                />
                <label
                  htmlFor="login-email"
                  className="absolute left-4 top-2 text-[9px] font-black uppercase tracking-wider text-slate-500 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-xs peer-placeholder-shown:font-semibold peer-focus:top-2 peer-focus:text-[9px] peer-focus:font-black peer-focus:text-indigo-400 pointer-events-none"
                >
                  Email Address
                </label>
              </div>

              {/* Password with Floating Label */}
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="login-password"
                  value={form.password}
                  onChange={(event) => setForm({ ...form, password: event.target.value })}
                  className="peer w-full rounded-2xl border border-white/10 bg-black/40 pl-4 pr-12 pt-6 pb-2 text-sm font-semibold text-white outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 placeholder-transparent"
                  placeholder="Password"
                  required
                />
                <label
                  htmlFor="login-password"
                  className="absolute left-4 top-2 text-[9px] font-black uppercase tracking-wider text-slate-500 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-xs peer-placeholder-shown:font-semibold peer-focus:top-2 peer-focus:text-[9px] peer-focus:font-black peer-focus:text-indigo-400 pointer-events-none"
                >
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition"
                >
                  {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                </button>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="remember-me"
                    checked={form.remember}
                    onChange={(event) => setForm({ ...form, remember: event.target.checked })}
                    className="h-4 w-4 rounded border-white/10 bg-black/40 text-indigo-650 focus:ring-indigo-500/20"
                  />
                  <label htmlFor="remember-me" className="text-xs font-bold text-slate-400 cursor-pointer">
                    Remember me
                  </label>
                </div>
                <Link to="/forgot-password" className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition">
                  Forgot Password?
                </Link>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={authLoading}
                className="w-full rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-violet-600 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-indigo-500/20 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-75 mt-2"
              >
                {authLoading ? 'Signing in…' : 'Sign in'}
              </button>
            </form>

            <div className="mt-6 flex items-center gap-3 text-slate-650">
              <span className="h-px flex-1 bg-white/10" />
              <span className="text-[9px] font-bold uppercase tracking-wider">Or continue with</span>
              <span className="h-px flex-1 bg-white/10" />
            </div>

            {/* Google Login */}
            <button
              type="button"
              onClick={async () => {
                try {
                  await googleSignIn()
                  navigate('/dashboard')
                } catch (error) {
                  // toast handled by auth context
                }
              }}
              disabled={authLoading}
              className="mt-6 flex w-full items-center justify-center gap-3 rounded-2xl border border-white/10 bg-black/40 py-3.5 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-75"
            >
              <svg className="h-4.5 w-4.5 mr-1" viewBox="0 0 24 24" width="24" height="24">
                <path
                  fill="#EA4335"
                  d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.339 0 3.33 2.69 1.455 6.611l3.81 3.154z"
                />
                <path
                  fill="#34A853"
                  d="M16.04 15.345c-1.07.727-2.43 1.164-4.04 1.164-2.909 0-5.38-1.964-6.26-4.59L1.87 15.05c1.88 3.73 5.76 6.3 10.13 6.3 3.11 0 5.95-1.09 8.04-2.95l-3.999-3.056z"
                />
                <path
                  fill="#4285F4"
                  d="M23.49 12.273c0-.818-.08-1.609-.218-2.364H12v4.51h6.47c-.29 1.48-1.14 2.73-2.43 3.56l4 3.06c2.33-2.15 3.66-5.31 3.66-8.766z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.74 11.918a7.08 7.08 0 0 1 0-2.153L1.93 6.61A11.974 11.974 0 0 0 0 12c0 1.92.455 3.73 1.258 5.345l3.81-2.936a7.126 7.126 0 0 1-.672-2.49z"
                />
              </svg>
              Sign in with Google
            </button>

            <p className="mt-8 text-center text-xs font-semibold text-slate-550">
              Don’t have an account?{' '}
              <Link to="/register" className="font-bold text-white hover:text-indigo-400 transition ml-1">
                Create account
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default Login
