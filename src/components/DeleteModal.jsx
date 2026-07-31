function DeleteModal({ title, message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
      <div className="w-full max-w-md rounded-[2rem] border border-slate-200/80 bg-white p-8 shadow-soft backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{title}</h2>
        <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-400">{message}</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-3xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-3xl bg-rose-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-500/10 transition hover:bg-rose-600"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

export default DeleteModal
