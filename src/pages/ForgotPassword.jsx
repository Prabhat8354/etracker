import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthContext } from '../context/AuthContext.jsx'
import toast from 'react-hot-toast'

function ForgotPassword() {
  const { resetPassword, authLoading } = useAuthContext()
  const [email, setEmail] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!email) {
      toast.error('Please enter your email address.')
      return
    }

    try {
      await resetPassword(email.trim())
      setEmail('')
    } catch (error) {
      // toast handled by auth context
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white">
      <div className="mx-auto flex min-h-screen max-w-4xl flex-col justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-10 shadow-soft backdrop-blur-xl sm:p-14">
          <div className="mb-8">
            <div className="inline-flex items-center gap-3 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-slate-100/80">
              <span className="h-8 w-8 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white">e</span>
              <span>eTracker</span>
            </div>
          </div>
          <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-6">
              <div>
                <p className="text-sm text-slate-400">Password recovery</p>
                <h1 className="text-4xl font-semibold tracking-tight">Reset your account password.</h1>
              </div>
              <p className="max-w-xl text-slate-300">Enter the email address associated with your account and we will send a password reset link via Firebase.</p>
              <div className="space-y-4 rounded-[2rem] bg-slate-900/60 p-8 shadow-glow">
                <div className="flex items-start gap-4">
                  <div className="mt-1 h-10 w-10 rounded-3xl bg-sky-500/10 p-2 text-sky-300">✓</div>
                  <div>
                    <p className="font-semibold">Secure recovery</p>
                    <p className="text-sm text-slate-400">Reset your password quickly and safely from your email.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="mt-1 h-10 w-10 rounded-3xl bg-indigo-500/10 p-2 text-indigo-300">✓</div>
                  <div>
                    <p className="font-semibold">Firebase powered</p>
                    <p className="text-sm text-slate-400">Your account security is managed by Firebase authentication.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-8 shadow-soft backdrop-blur-xl">
              <form onSubmit={handleSubmit} className="space-y-5">
                <label className="block text-sm text-slate-300">
                  Email address
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="mt-3 w-full rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    placeholder="you@example.com"
                  />
                </label>
                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full rounded-3xl bg-gradient-to-r from-indigo-500 to-violet-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {authLoading ? 'Sending reset email…' : 'Send reset link'}
                </button>
              </form>
              <p className="mt-6 text-center text-sm text-slate-400">
                Remembered it? <Link to="/login" className="font-semibold text-white hover:text-indigo-300">Return to login</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword
