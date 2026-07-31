function SearchBar({ value, onChange }) {
  return (
    <div className="relative max-w-xl">
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search transactions, categories, notes"
        className="w-full rounded-3xl border border-slate-200 bg-white py-3 pl-4 pr-4 text-sm text-slate-700 shadow-sm transition duration-300 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-indigo-400 dark:focus:ring-indigo-600/20"
      />
    </div>
  )
}

export default SearchBar
