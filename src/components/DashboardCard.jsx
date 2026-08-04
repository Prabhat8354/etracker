import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { useExpenseContext } from '../context/ExpenseContext.jsx'

function AnimatedCounter({ value, currency }) {
  const [displayValue, setDisplayValue] = useState(0)
  const prevValueRef = useRef(0)

  useEffect(() => {
    let startTimestamp = null
    const startValue = prevValueRef.current
    const endValue = Number(value) || 0
    prevValueRef.current = endValue

    if (startValue === endValue) {
      setDisplayValue(endValue)
      return
    }

    const duration = 900
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp
      const elapsed = timestamp - startTimestamp
      const progress = Math.min(elapsed / duration, 1)
      
      // Easing function (easeOutExpo)
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress)
      
      const currentValue = startValue + easeProgress * (endValue - startValue)
      setDisplayValue(currentValue)

      if (progress < 1) {
        window.requestAnimationFrame(step)
      } else {
        setDisplayValue(endValue)
      }
    }

    const frameId = window.requestAnimationFrame(step)
    return () => window.cancelAnimationFrame(frameId)
  }, [value])

  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(displayValue)

  return <span>{formatted}</span>
}

function DashboardCard({ label, value, percentage, icon, gradient }) {
  const { settings } = useExpenseContext()
  const currency = settings?.currency || 'USD'
  const isPositive = !percentage.startsWith('-')

  return (
    <motion.article
      layout
      whileHover={{ y: -5, scale: 1.015 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className="rounded-3xl border border-slate-200/30 bg-white/60 p-6 shadow-soft backdrop-blur-md dark:border-white/[0.02] dark:bg-slate-950/40 transition duration-300 relative overflow-hidden hover:border-indigo-500/20 dark:hover:border-indigo-500/20 hover:shadow-glow"
    >
      {/* Decorative Glow Blob behind the icon */}
      <div className={`absolute -top-12 -left-12 h-28 w-28 rounded-full bg-gradient-to-br ${gradient} opacity-[0.06] dark:opacity-[0.08] blur-xl pointer-events-none`} />

      <div className="flex items-center justify-between gap-4 relative z-10">
        <span className={`inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} text-white shadow-md shadow-indigo-500/10`}>
          {icon}
        </span>
        <span className={`rounded-lg px-2.5 py-1 text-[9px] font-black uppercase tracking-wider ${
          isPositive
            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
            : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
        }`}>
          {percentage}
        </span>
      </div>

      <div className="mt-8 relative z-10">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">{label}</p>
        <p className="mt-2 text-2.5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-none">
          <AnimatedCounter value={value} currency={currency} />
        </p>
      </div>
    </motion.article>
  )
}

export default DashboardCard
