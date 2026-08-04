import { Search } from 'lucide-react'

function SearchBar({ value, onChange }) {
  return (
    <div className="relative w-full max-w-md group">
      <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors duration-150">
        <Search className="h-4 w-4" />
      </div>
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search logs, categories, notes..."
        className="w-full rounded-xl border border-slate-200/50 bg-slate-50/50 py-2.5 pl-10 pr-12 text-xs font-semibold text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 dark:border-white/[0.04] dark:bg-slate-900/30 dark:text-slate-200 dark:placeholder:text-slate-500 dark:focus:border-indigo-400 dark:focus:bg-slate-950 dark:focus:ring-indigo-650/10"
      />
      <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
        <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[9px] font-bold text-slate-400 dark:border-white/[0.06] dark:bg-slate-900/60 dark:text-slate-500">
          ⌘K
        </kbd>
      </div>
    </div>
  )
}

export default SearchBar
