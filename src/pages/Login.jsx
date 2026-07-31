import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthContext } from '../context/AuthContext.jsx'
import toast from 'react-hot-toast'

function Login() {
  const { login, googleSignIn, authLoading } = useAuthContext()
  const [form, setForm] = useState({ email: '', password: '', remember: true })
  const navigate = useNavigate()

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!form.email || !form.password) {
      toast.error('Email and password are required.')
      return
    }
    try {
      await login(form)
      navigate('/dashboard')
    } catch (error) {
      // handled by toast
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-10 shadow-soft backdrop-blur-xl">
            <div className="mb-10">
              <div className="inline-flex items-center gap-3 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-slate-100/80">
                <span className="h-8 w-8 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white">e</span>
                <span>eTracker</span>
              </div>
            </div>
            <div className="space-y-6">
              <h1 className="text-4xl font-semibold tracking-tight">Bring your finances into focus.</h1>
              <p className="max-w-xl text-slate-300">Secure access, per-user expense history, and premium analytics—powered by Firebase Auth and a polished dashboard experience.</p>
            </div>
            <div className="mt-12 space-y-4 rounded-[2rem] bg-slate-900/60 p-8 shadow-glow">
              <div className="flex items-start gap-4">
                <div className="mt-1 h-10 w-10 rounded-3xl bg-indigo-500/10 p-2 text-indigo-300">✓</div>
                <div>
                  <p className="font-semibold">Secure login with email and Google</p>
                  <p className="text-sm text-slate-400">Protect your account with Firebase authentication and remember login state securely.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="mt-1 h-10 w-10 rounded-3xl bg-emerald-500/10 p-2 text-emerald-300">✓</div>
                <div>
                  <p className="font-semibold">Personal expense history</p>
                  <p className="text-sm text-slate-400">Each user sees only their own financial records and analytics.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="mt-1 h-10 w-10 rounded-3xl bg-sky-500/10 p-2 text-sky-300">✓</div>
                <div>
                  <p className="font-semibold">Password recovery included</p>
                  <p className="text-sm text-slate-400">Forgot your password? Reset it instantly with just your email.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-8 shadow-soft backdrop-blur-xl">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Welcome back</p>
                <h2 className="text-2xl font-semibold text-white">Login to your account</h2>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <label className="block text-sm text-slate-300">
                Email
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm({ ...form, email: event.target.value })}
                  className="mt-3 w-full rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  placeholder="you@example.com"
                />
              </label>
              <label className="block text-sm text-slate-300">
                Password
                <input
                  type="password"
                  value={form.password}
                  onChange={(event) => setForm({ ...form, password: event.target.value })}
                  className="mt-3 w-full rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  placeholder="Enter your password"
                />
              </label>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <label className="inline-flex items-center gap-2 text-sm text-slate-300">
                  <input
                    type="checkbox"
                    checked={form.remember}
                    onChange={(event) => setForm({ ...form, remember: event.target.checked })}
                    className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-indigo-500 focus:ring-indigo-500"
                  />
                  Remember me
                </label>
                <Link to="/forgot-password" className="text-sm font-semibold text-indigo-400 transition hover:text-indigo-300">Forgot password?</Link>
              </div>
              <button
                type="submit"
                disabled={authLoading}
                className="w-full rounded-3xl bg-gradient-to-r from-indigo-500 to-violet-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {authLoading ? 'Signing in…' : 'Sign in'}
              </button>
            </form>
            <div className="mt-6 flex items-center gap-3 text-slate-500">
              <span className="h-px flex-1 bg-slate-700" />
              <span className="text-sm">Or continue with</span>
              <span className="h-px flex-1 bg-slate-700" />
            </div>
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
              className="mt-6 flex w-full items-center justify-center gap-3 rounded-3xl border border-slate-700 bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:border-indigo-500 disabled:cursor-not-allowed disabled:opacity-70"
            >
              Sign in with Google
            </button>
            <p className="mt-6 text-center text-sm text-slate-400">
              Don’t have an account? <Link to="/register" className="font-semibold text-white hover:text-indigo-300">Create account</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
