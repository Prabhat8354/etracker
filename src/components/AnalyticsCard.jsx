import { motion } from 'framer-motion'

function AnalyticsCard({ title, value, description }) {
  return (
    <motion.article
      whileHover={{ y: -4, scale: 1.01 }}
      className="glass-card rounded-[2rem] p-6 transition duration-300 relative overflow-hidden"
    >
      {/* Decorative background accent */}
      <div className="absolute -bottom-10 -right-10 h-24 w-24 rounded-full bg-indigo-500/5 blur-xl pointer-events-none" />
      
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">{title}</p>
      <p className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">{value}</p>
      <p className="mt-2 text-xs font-semibold leading-normal text-slate-500 dark:text-slate-400">{description}</p>
    </motion.article>
  )
}

export default AnalyticsCard
