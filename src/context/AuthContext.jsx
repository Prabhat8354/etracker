import { createContext, useContext, useEffect, useState } from 'react'
import { auth, db } from '../firebase/firebaseConfig.js'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { DEFAULT_CURRENCY } from '../utils/currency.js'
import {
  browserLocalPersistence,
  browserSessionPersistence,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  setPersistence,
  updateProfile,
} from 'firebase/auth'
import toast from 'react-hot-toast'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [authError, setAuthError] = useState(null)

  useEffect(() => {
    if (!auth) {
      setAuthLoading(false)
      setAuthError('Firebase is not configured.')
      return undefined
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        let userCurrency = null

        // Sync to Firestore users collection for friend/email lookup
        if (db) {
          try {
            const userDocRef = doc(db, 'users', firebaseUser.uid)
            const userDocSnap = await getDoc(userDocRef)
            if (userDocSnap.exists() && userDocSnap.data()?.currency) {
              userCurrency = userDocSnap.data().currency
            }

            await setDoc(
              userDocRef,
              {
                uid: firebaseUser.uid,
                email: (firebaseUser.email || '').toLowerCase(),
                displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
                photoURL: firebaseUser.photoURL || null,
                updatedAt: serverTimestamp(),
              },
              { merge: true }
            )
          } catch (err) {
            console.error('Failed to sync profile to Firestore:', err)
          }
        }

        const userData = {
          uid: firebaseUser.uid,
          email: (firebaseUser.email || '').toLowerCase(),
          displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
          photoURL: firebaseUser.photoURL || null,
          currency: userCurrency,
          createdAt: firebaseUser.metadata?.creationTime || null,
        }
        setUser(userData)
      } else {
        setUser(null)
      }
      setAuthLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const signUp = async ({ name, email, password, currency = DEFAULT_CURRENCY }) => {
    setAuthLoading(true)
    try {
      if (!auth) {
        throw new Error('Firebase is not configured.')
      }
      await setPersistence(auth, browserLocalPersistence)
      const result = await createUserWithEmailAndPassword(auth, email, password)
      const chosenCurrency = currency || DEFAULT_CURRENCY
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: name })
        setUser((prev) => ({
          ...prev,
          displayName: name,
          currency: chosenCurrency,
        }))

        // Save selected currency directly to Firestore user profile & settings
        if (db) {
          const uid = auth.currentUser.uid
          try {
            // 1. users/{uid} profile
            await setDoc(
              doc(db, 'users', uid),
              {
                uid,
                email: (email || '').toLowerCase(),
                displayName: name,
                photoURL: null,
                currency: chosenCurrency,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
              },
              { merge: true }
            )

            // 2. users/{uid}/settings/config
            await setDoc(
              doc(db, 'users', uid, 'settings', 'config'),
              {
                currency: chosenCurrency,
                monthlyBudget: 3000,
                language: 'en',
                animationSpeed: 'normal'
              },
              { merge: true }
            )

            // 3. users/{uid}/savings/goal
            await setDoc(
              doc(db, 'users', uid, 'savings', 'goal'),
              {
                amount: 500,
                frequency: 'monthly',
                currency: chosenCurrency
              },
              { merge: true }
            )
          } catch (err) {
            console.error('Failed to initialize user profile/settings in Firestore:', err)
          }

          // Pre-populate localStorage for immediate reactivity
          try {
            localStorage.setItem(
              `etracker_${uid}_settings`,
              JSON.stringify({
                currency: chosenCurrency,
                monthlyBudget: 3000,
                language: 'en',
                animationSpeed: 'normal'
              })
            )
          } catch (e) {
            console.error('LocalStorage write failed:', e)
          }
        }
      }
      toast.success('Account created successfully')
      setAuthError(null)
      return result
    } catch (error) {
      setAuthError(error.message)
      toast.error(error.message)
      throw error
    } finally {
      setAuthLoading(false)
    }
  }

  const login = async ({ email, password, remember }) => {
    setAuthLoading(true)
    try {
      if (!auth) {
        throw new Error('Firebase is not configured.')
      }
      await setPersistence(auth, remember ? browserLocalPersistence : browserSessionPersistence)
      const result = await signInWithEmailAndPassword(auth, email, password)
      toast.success('Welcome back!')
      setAuthError(null)
      return result
    } catch (error) {
      setAuthError(error.message)
      toast.error(error.message)
      throw error
    } finally {
      setAuthLoading(false)
    }
  }

  const updateProfileInfo = async (updates) => {
    setAuthLoading(true)
    try {
      if (!auth) {
        throw new Error('Firebase is not configured.')
      }
      if (!auth.currentUser) throw new Error('No authenticated user found.')
      await updateProfile(auth.currentUser, updates)
      const firebaseUser = auth.currentUser
      setUser((prev) => ({
        ...prev,
        displayName: firebaseUser.displayName || prev?.displayName,
        photoURL: firebaseUser.photoURL || prev?.photoURL,
      }))
      if (db) {
        await setDoc(
          doc(db, 'users', firebaseUser.uid),
          {
            displayName: firebaseUser.displayName || '',
            photoURL: firebaseUser.photoURL || null,
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        )
      }
      toast.success('Profile updated successfully')
    } catch (error) {
      toast.error(error.message)
      throw error
    } finally {
      setAuthLoading(false)
    }
  }

  const googleSignIn = async () => {
    setAuthLoading(true)
    try {
      if (!auth) {
        throw new Error('Firebase is not configured.')
      }
      await setPersistence(auth, browserLocalPersistence)
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      toast.success('Signed in successfully')
      setAuthError(null)
      return result
    } catch (error) {
      setAuthError(error.message)
      toast.error(error.message)
      throw error
    } finally {
      setAuthLoading(false)
    }
  }

  const resetPassword = async (email) => {
    try {
      if (!auth) {
        throw new Error('Firebase is not configured.')
      }
      await sendPasswordResetEmail(auth, email)
      toast.success('Password reset email sent')
    } catch (error) {
      toast.error(error.message)
      throw error
    }
  }

  const logout = async () => {
    setAuthLoading(true)
    try {
      if (!auth) {
        throw new Error('Firebase is not configured.')
      }
      await signOut(auth)
      toast.success('Logged out successfully')
      setAuthError(null)
    } catch (error) {
      setAuthError(error.message)
      toast.error(error.message)
      throw error
    } finally {
      setAuthLoading(false)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        authLoading,
        authError,
        signUp,
        login,
        googleSignIn,
        updateProfileInfo,
        resetPassword,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuthContext = () => useContext(AuthContext)
