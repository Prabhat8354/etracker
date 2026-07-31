import { useExpenseContext } from '../context/ExpenseContext.jsx'

function Filters() {
  const { filters, setFilters, categories } = useExpenseContext()

  return (
    <div className="grid gap-4 xl:grid-cols-4">
      <div className="rounded-3xl border border-slate-200/80 bg-slate-50 p-4 dark:border-slate-800/80 dark:bg-slate-900/80">
        <label className="block text-sm font-medium text-slate-600 dark:text-slate-300">Type</label>
        <select
          value={filters.type}
          onChange={(event) => setFilters({ ...filters, type: event.target.value })}
          className="mt-3 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-600/20"
        >
          <option value="all">All</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
      </div>

      <div className="rounded-3xl border border-slate-200/80 bg-slate-50 p-4 dark:border-slate-800/80 dark:bg-slate-900/80">
        <label className="block text-sm font-medium text-slate-600 dark:text-slate-300">Category</label>
        <select
          value={filters.category}
          onChange={(event) => setFilters({ ...filters, category: event.target.value })}
          className="mt-3 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-600/20"
        >
          <option value="all">All</option>
          {categories.map((category) => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>

      <div className="rounded-3xl border border-slate-200/80 bg-slate-50 p-4 dark:border-slate-800/80 dark:bg-slate-900/80">
        <label className="block text-sm font-medium text-slate-600 dark:text-slate-300">Date range</label>
        <select
          value={filters.range}
          onChange={(event) => setFilters({ ...filters, range: event.target.value })}
          className="mt-3 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-600/20"
        >
          <option value="all">All time</option>
          <option value="last7">Last 7 days</option>
          <option value="last30">Last 30 days</option>
        </select>
      </div>

      <div className="rounded-3xl border border-slate-200/80 bg-slate-50 p-4 dark:border-slate-800/80 dark:bg-slate-900/80">
        <label className="block text-sm font-medium text-slate-600 dark:text-slate-300">Sort</label>
        <select
          value={filters.sort}
          onChange={(event) => setFilters({ ...filters, sort: event.target.value })}
          className="mt-3 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-600/20"
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="highest">Highest amount</option>
          <option value="lowest">Lowest amount</option>
        </select>
      </div>
    </div>
  )
}

export default Filters
