import { useState, useRef } from 'react'
import { useAuthContext } from '../context/AuthContext.jsx'
import { formatDate } from '../utils/helpers.jsx'
import { motion } from 'framer-motion'
import { User, Mail, Calendar, Key, ShieldCheck, Image as ImageIcon, Sparkles, Upload, Trash2, Camera } from 'lucide-react'
import toast from 'react-hot-toast'

function Profile() {
  const { user, updateProfileInfo, authLoading } = useAuthContext()
  const [displayName, setDisplayName] = useState(user?.displayName || '')
  const [photoURL, setPhotoURL] = useState(user?.photoURL || '')
  const [previewURL, setPreviewURL] = useState(user?.photoURL || '')
  const [isSaving, setIsSaving] = useState(false)
  const fileInputRef = useRef(null)

  const handleFileChange = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      toast.error('File size must be less than 2MB.')
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      const base64 = reader.result
      setPreviewURL(base64)
      setPhotoURL(base64)
      toast.success('Avatar loaded. Save changes to update.')
    }
    reader.readAsDataURL(file)
  }

  const handleRemovePhoto = () => {
    setPreviewURL('')
    setPhotoURL('')
    toast.success('Avatar removed. Save changes to update.')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setIsSaving(true)
    try {
      await updateProfileInfo({
        displayName: displayName.trim(),
        photoURL: photoURL || null
      })
      toast.success('Profile credentials updated successfully')
    } catch (error) {
      toast.error('Failed to update credentials profile.')
    } finally {
      setIsSaving(false)
    }
  }

  const profileInitials = displayName?.charAt(0) || user?.email?.charAt(0) || 'U'

  return (
    <div className="space-y-6 pb-10">
      
      {/* Title Header Card */}
      <section className="rounded-3xl border border-slate-200/30 bg-white/60 p-8 shadow-soft backdrop-blur-md dark:border-white/[0.02] dark:bg-slate-950/40 relative overflow-hidden">
        <div className="absolute -top-16 -right-16 h-36 w-36 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none" />
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-indigo-500" />
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-indigo-600 dark:text-indigo-400">Account Details</p>
        </div>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white leading-tight">
          Manage Profile Settings
        </h1>
        <p className="mt-2 text-xs font-semibold text-slate-400 dark:text-slate-500 max-w-xl leading-relaxed">
          Update public display credentials, upload custom avatars, and review access logs.
        </p>
      </section>

      {/* Main Layout Grid */}
      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        
        {/* Left Side: Detail & Form Edit */}
        <div className="rounded-3xl border border-slate-200/30 bg-white/60 p-8 shadow-soft backdrop-blur-md dark:border-white/[0.02] dark:bg-slate-950/40 space-y-8">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-800 dark:text-white">Profile Details</h2>
            <p className="mt-1 text-xs font-semibold text-slate-400 dark:text-slate-500">
              Personal workspace credentials and custom details.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            
            {/* Avatar Display Card */}
            <div className="rounded-2xl border border-slate-200/30 bg-white/40 p-6 text-center dark:border-white/[0.02] dark:bg-slate-900/10 flex flex-col justify-center items-center relative group">
              <div className="relative h-24 w-24">
                {previewURL ? (
                  <img
                    src={previewURL}
                    alt={displayName}
                    className="h-24 w-24 rounded-3xl object-cover border border-slate-200/40 dark:border-white/[0.04] shadow-md transition duration-300 group-hover:brightness-90"
                  />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 text-4xl font-extrabold text-white shadow-lg">
                    {profileInitials.toUpperCase()}
                  </div>
                )}
                
                {/* Clickable Overlay to Upload */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 flex items-center justify-center bg-black/40 text-white rounded-3xl opacity-0 group-hover:opacity-100 transition duration-200 cursor-pointer"
                  aria-label="Upload profile image"
                >
                  <Camera className="h-6 w-6" />
                </button>
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 dark:bg-slate-900 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-350 hover:bg-slate-200 dark:hover:bg-slate-800 transition"
                >
                  <Upload className="h-3 w-3" />
                  Upload
                </button>
                {previewURL && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-rose-500/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 transition"
                  >
                    <Trash2 className="h-3 w-3" />
                    Remove
                  </button>
                )}
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
            </div>

            {/* Static Credentials Card */}
            <div className="rounded-2xl border border-slate-200/30 bg-white/40 p-6 dark:border-white/[0.02] dark:bg-slate-900/10 space-y-4 flex flex-col justify-center">
              <div>
                <p className="flex items-center gap-2 text-[9px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  <User className="h-3.5 w-3.5 text-indigo-500" />
                  Full Name
                </p>
                <p className="mt-1.5 text-base font-bold text-slate-800 dark:text-white">
                  {user?.displayName || 'Anonymous User'}
                </p>
              </div>

              <div>
                <p className="flex items-center gap-2 text-[9px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  <Mail className="h-3.5 w-3.5 text-purple-500" />
                  Registered Email
                </p>
                <p className="mt-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 truncate">
                  {user?.email}
                </p>
              </div>

              <div>
                <p className="flex items-center gap-2 text-[9px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  <Calendar className="h-3.5 w-3.5 text-emerald-500" />
                  Member Since
                </p>
                <p className="mt-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
                  {user?.createdAt ? formatDate(user.createdAt) : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Form edit */}
          <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200/30 bg-white/40 p-6 dark:border-white/[0.02] dark:bg-slate-900/10 space-y-5">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                <User className="h-3.5 w-3.5 text-indigo-500" />
                Display Name
              </label>
              <input
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm font-semibold text-slate-900 dark:text-white outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 dark:focus:border-indigo-400"
                placeholder="Change display name"
                required
              />
            </div>

            <motion.button
              type="submit"
              disabled={authLoading || isSaving}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-5 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-indigo-500/20 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSaving ? 'Updating...' : 'Save Profile Changes'}
            </motion.button>
          </form>
        </div>

        {/* Right Side: Account Summary Checklist */}
        <div className="rounded-3xl border border-slate-200/30 bg-white/60 p-8 shadow-soft backdrop-blur-md dark:border-white/[0.02] dark:bg-slate-950/40 space-y-6">
          <div>
            <h3 className="text-lg font-bold tracking-tight text-slate-800 dark:text-white">Workspace Security</h3>
            <p className="mt-1 text-xs font-semibold text-slate-400 dark:text-slate-500">
              Access permissions and auth status.
            </p>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200/30 bg-white/40 p-4 dark:border-white/[0.02] dark:bg-slate-900/10 flex items-start gap-3">
              <Key className="h-5 w-5 text-indigo-500 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-white">Authentication Protocol</h4>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 font-semibold">Firebase encrypted accounts database access.</p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/30 bg-white/40 p-4 dark:border-white/[0.02] dark:bg-slate-900/10 flex items-start gap-3">
              <ShieldCheck className="h-5 w-5 text-emerald-500 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-white">Profile status</h4>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 font-semibold">
                  {user?.displayName ? 'Fully configured profile.' : 'Anonymous credentials.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
