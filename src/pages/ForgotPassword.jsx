import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthContext } from '../context/AuthContext.jsx'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import { ShieldCheck, ArrowLeft, Mail } from 'lucide-react'

function ForgotPassword() {
  const { resetPassword, authLoading } = useAuthContext()
  const [email, setEmail] = useState('')
  const [shakeOnError, setShakeOnError] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!email) {
      toast.error('Please enter your email address.')
      setShakeOnError(true)
      setTimeout(() => setShakeOnError(false), 500)
      return
    }

    try {
      await resetPassword(email.trim())
      setEmail('')
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
          
          {/* Left Panel: Overview */}
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
                  Recover your workspace <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">password</span>.
                </h1>
                <p className="text-slate-400 font-semibold leading-relaxed">
                  Provide your account email and we'll dispatch an automated Firebase reset dispatch securely to your inbox.
                </p>
              </div>
            </div>

            <div className="mt-14 space-y-4 rounded-3xl border border-white/5 bg-white/[0.02] p-6 backdrop-blur-md">
              <div className="flex items-start gap-4">
                <div className="mt-0.5 rounded-xl bg-indigo-500/10 p-2 text-indigo-400 border border-indigo-500/20">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-200">State Preserving Recovery</h4>
                  <p className="text-xs font-semibold text-slate-400 mt-0.5">Your existing transactions records remain fully preserved after updating.</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Panel: Glass Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={shakeOnError ? { x: [-10, 10, -10, 10, 0] } : { x: 0 }}
            transition={shakeOnError ? { duration: 0.4 } : { duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            className="w-full max-w-md mx-auto rounded-[2.5rem] border border-white/10 bg-slate-900/40 p-8 shadow-2xl backdrop-blur-xl"
          >
            <div className="mb-6">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-555">Security Check</p>
              <h2 className="text-2xl font-black text-white mt-1.5">Reset Password</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Email with Floating Label */}
              <div className="relative">
                <input
                  type="email"
                  id="reset-email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="peer w-full rounded-2xl border border-white/10 bg-black/40 px-4 pt-6 pb-2 text-sm font-semibold text-white outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 placeholder-transparent"
                  placeholder="Email"
                  required
                />
                <label
                  htmlFor="reset-email"
                  className="absolute left-4 top-2 text-[9px] font-black uppercase tracking-wider text-slate-500 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-xs peer-placeholder-shown:font-semibold peer-focus:top-2 peer-focus:text-[9px] peer-focus:font-black peer-focus:text-indigo-400 pointer-events-none"
                >
                  Email Address
                </label>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={authLoading}
                className="w-full rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-violet-600 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-indigo-500/20 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-75 mt-2"
              >
                {authLoading ? 'Sending link…' : 'Send reset link'}
              </button>
            </form>

            <Link
              to="/login"
              className="mt-8 flex items-center justify-center gap-2 text-xs font-bold text-slate-500 hover:text-white transition"
            >
              <ArrowLeft className="h-4 w-4" />
              Return to login
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword
