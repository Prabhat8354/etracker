import { useState } from 'react'
import { useAuthContext } from '../context/AuthContext.jsx'
import { formatDate } from '../utils/helpers.jsx'

function Profile() {
  const { user, updateProfileInfo, authLoading } = useAuthContext()
  const [displayName, setDisplayName] = useState(user?.displayName || '')
  const [photoURL, setPhotoURL] = useState(user?.photoURL || '')
  const [isSaving, setIsSaving] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setIsSaving(true)
    try {
      await updateProfileInfo({ displayName, photoURL: photoURL || null })
    } catch (error) {
      // toast handled in auth context
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] border border-slate-200/80 bg-white/80 p-8 shadow-soft backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950/80">
        <p className="text-sm uppercase tracking-[0.35em] text-indigo-600 dark:text-indigo-400">Profile</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-900 dark:text-slate-100">Your account details</h1>
        <p className="mt-3 max-w-2xl text-slate-500 dark:text-slate-400">Keep your profile photo and display name up to date for a polished dashboard experience.</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.65fr_0.35fr]">
        <div className="rounded-[2rem] border border-slate-200/80 bg-white/80 p-8 shadow-soft backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950/80">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Profile details</h2>
          <div className="mt-8 space-y-8">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[1.75rem] border border-slate-200/80 bg-slate-50 p-6 text-center dark:border-slate-800/80 dark:bg-slate-900/80">
                {user?.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName} className="mx-auto h-24 w-24 rounded-full object-cover" />
                ) : (
                  <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-4xl font-bold text-white shadow-lg shadow-indigo-500/20">
                    {user?.displayName?.charAt(0) || 'U'}
                  </div>
                )}
                <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Profile photo</p>
              </div>
              <div className="rounded-[1.75rem] border border-slate-200/80 bg-slate-50 p-6 dark:border-slate-800/80 dark:bg-slate-900/80">
                <p className="text-sm text-slate-500 dark:text-slate-400">Full name</p>
                <p className="mt-2 text-xl font-semibold text-slate-900 dark:text-slate-100">{user?.displayName || 'Anonymous User'}</p>
                <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Email</p>
                <p className="mt-2 text-base text-slate-700 dark:text-slate-200">{user?.email}</p>
                <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Member since</p>
                <p className="mt-2 text-base text-slate-700 dark:text-slate-200">{user?.createdAt ? formatDate(user.createdAt) : 'N/A'}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 rounded-[1.75rem] border border-slate-200/80 bg-slate-50 p-6 dark:border-slate-800/80 dark:bg-slate-900/80">
              <div>
                <label className="block text-sm font-semibold text-slate-900 dark:text-slate-100">Display name</label>
                <input
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                  className="mt-3 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-900 dark:text-slate-100">Profile photo URL</label>
                <input
                  value={photoURL}
                  onChange={(event) => setPhotoURL(event.target.value)}
                  className="mt-3 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                  placeholder="https://..."
                />
              </div>
              <button
                type="submit"
                disabled={authLoading || isSaving}
                className="rounded-3xl bg-gradient-to-r from-indigo-500 to-violet-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSaving ? 'Saving...' : 'Update profile'}
              </button>
            </form>
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-200/80 bg-white/80 p-8 shadow-soft backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950/80">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Account summary</h2>
          <div className="mt-6 space-y-4">
            <div className="rounded-3xl bg-slate-100 p-4 dark:bg-slate-900/80">
              <p className="text-sm text-slate-500 dark:text-slate-400">Security</p>
              <p className="mt-2 text-base font-semibold text-slate-900 dark:text-slate-100">Firebase authentication</p>
            </div>
            <div className="rounded-3xl bg-slate-100 p-4 dark:bg-slate-900/80">
              <p className="text-sm text-slate-500 dark:text-slate-400">Profile status</p>
              <p className="mt-2 text-base font-semibold text-slate-900 dark:text-slate-100">{user?.displayName ? 'Complete' : 'Incomplete'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
