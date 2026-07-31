import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthContext } from '../context/AuthContext.jsx'
import toast from 'react-hot-toast'

function Register() {
  const { signUp, authLoading } = useAuthContext()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const navigate = useNavigate()

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!form.name || !form.email || !form.password || !form.confirmPassword) {
      toast.error('All fields are required.')
      return
    }
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match.')
      return
    }

    try {
      await signUp({ name: form.name.trim(), email: form.email.trim(), password: form.password })
      toast.success('Registration successful. Redirecting...')
      navigate('/dashboard')
    } catch (error) {
      // toast handled by auth context
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
              <h1 className="text-4xl font-semibold tracking-tight">Create your secure account.</h1>
              <p className="max-w-xl text-slate-300">Start tracking expenses privately with Firebase authentication, secure persistence, and premium analytics.</p>
            </div>
            <div className="mt-12 space-y-4 rounded-[2rem] bg-slate-900/60 p-8 shadow-glow">
              <div className="flex items-start gap-4">
                <div className="mt-1 h-10 w-10 rounded-3xl bg-indigo-500/10 p-2 text-indigo-300">✓</div>
                <div>
                  <p className="font-semibold">Email + password sign up</p>
                  <p className="text-sm text-slate-400">Register quickly and manage your own expense dashboard.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="mt-1 h-10 w-10 rounded-3xl bg-emerald-500/10 p-2 text-emerald-300">✓</div>
                <div>
                  <p className="font-semibold">Private expense data</p>
                  <p className="text-sm text-slate-400">Each account stores its own records in your browser along with the Firebase auth session.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="mt-1 h-10 w-10 rounded-3xl bg-sky-500/10 p-2 text-sky-300">✓</div>
                <div>
                  <p className="font-semibold">Easy account recovery</p>
                  <p className="text-sm text-slate-400">Forgot password? Reset it through the login screen.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-8 shadow-soft backdrop-blur-xl">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Create account</p>
                <h2 className="text-2xl font-semibold text-white">Register your user</h2>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <label className="block text-sm text-slate-300">
                Full name
                <input
                  type="text"
                  value={form.name}
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                  className="mt-3 w-full rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  placeholder="Alex Morgan"
                />
              </label>
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
                  placeholder="Create a strong password"
                />
              </label>
              <label className="block text-sm text-slate-300">
                Confirm password
                <input
                  type="password"
                  value={form.confirmPassword}
                  onChange={(event) => setForm({ ...form, confirmPassword: event.target.value })}
                  className="mt-3 w-full rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  placeholder="Repeat your password"
                />
              </label>
              <button
                type="submit"
                disabled={authLoading}
                className="w-full rounded-3xl bg-gradient-to-r from-indigo-500 to-violet-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {authLoading ? 'Creating account…' : 'Create account'}
              </button>
            </form>
            <p className="mt-6 text-center text-sm text-slate-400">
              Already have an account? <Link to="/login" className="font-semibold text-white hover:text-indigo-300">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register
