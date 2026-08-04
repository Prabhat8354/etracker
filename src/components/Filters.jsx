import { useExpenseContext } from '../context/ExpenseContext.jsx'
import { Filter, Tags, CalendarRange, ArrowUpDown } from 'lucide-react'

function Filters() {
  const { filters, setFilters, categories } = useExpenseContext()

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* Type Filter */}
      <div className="rounded-2xl border border-slate-200/50 bg-slate-50/50 p-4 dark:border-slate-800/50 dark:bg-slate-900/30">
        <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          <Filter className="h-3.5 w-3.5 text-indigo-500" />
          Type
        </label>
        <select
          value={filters.type}
          onChange={(event) => setFilters({ ...filters, type: event.target.value })}
          className="mt-3 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-700 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:focus:border-indigo-400 dark:focus:ring-indigo-600/20"
        >
          <option value="all">All Entries</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
      </div>

      {/* Category Filter */}
      <div className="rounded-2xl border border-slate-200/50 bg-slate-50/50 p-4 dark:border-slate-800/50 dark:bg-slate-900/30">
        <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          <Tags className="h-3.5 w-3.5 text-violet-500" />
          Category
        </label>
        <select
          value={filters.category}
          onChange={(event) => setFilters({ ...filters, category: event.target.value })}
          className="mt-3 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-700 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:focus:border-indigo-400 dark:focus:ring-indigo-600/20"
        >
          <option value="all">All Categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>

      {/* Date Range Filter */}
      <div className="rounded-2xl border border-slate-200/50 bg-slate-50/50 p-4 dark:border-slate-800/50 dark:bg-slate-900/30">
        <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          <CalendarRange className="h-3.5 w-3.5 text-emerald-500" />
          Date range
        </label>
        <select
          value={filters.range}
          onChange={(event) => setFilters({ ...filters, range: event.target.value })}
          className="mt-3 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-700 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:focus:border-indigo-400 dark:focus:ring-indigo-600/20"
        >
          <option value="all">All Time</option>
          <option value="last7">Last 7 Days</option>
          <option value="last30">Last 30 Days</option>
        </select>
      </div>

      {/* Sort Filter */}
      <div className="rounded-2xl border border-slate-200/50 bg-slate-50/50 p-4 dark:border-slate-800/50 dark:bg-slate-900/30">
        <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          <ArrowUpDown className="h-3.5 w-3.5 text-amber-500" />
          Sort by
        </label>
        <select
          value={filters.sort}
          onChange={(event) => setFilters({ ...filters, sort: event.target.value })}
          className="mt-3 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-700 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:focus:border-indigo-400 dark:focus:ring-indigo-600/20"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="highest">Highest Amount</option>
          <option value="lowest">Lowest Amount</option>
        </select>
      </div>
    </div>
  )
}

export default Filters
