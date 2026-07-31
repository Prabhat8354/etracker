function FirebaseConfigErrorPage({ missingEnvVars = [], errorMessage = 'Firebase is not configured.' }) {
  const hasMissingVars = missingEnvVars.length > 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 px-4 py-10 text-white sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-screen max-w-4xl items-center justify-center">
        <div className="w-full rounded-[2rem] border border-white/10 bg-slate-900/80 p-8 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-10">
          <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-rose-400/20 bg-rose-500/10 px-4 py-2 text-sm font-semibold text-rose-200">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
            Firebase configuration required
          </div>

          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Firebase is not configured.</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
            {errorMessage}
          </p>

          {hasMissingVars && (
            <div className="mt-8 rounded-2xl border border-slate-700 bg-slate-950/70 p-6">
              <h2 className="text-lg font-semibold text-white">Missing environment variables</h2>
              <ul className="mt-4 space-y-2 text-sm text-slate-300">
                {missingEnvVars.map((variable) => (
                  <li key={variable} className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-indigo-400" />
                    {variable}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-8 rounded-2xl border border-indigo-500/20 bg-indigo-500/10 p-5 text-sm text-indigo-100">
            <p className="font-semibold">Next step</p>
            <p className="mt-2 leading-6">
              Add your Firebase project values to the environment file and redeploy the app.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FirebaseConfigErrorPage
