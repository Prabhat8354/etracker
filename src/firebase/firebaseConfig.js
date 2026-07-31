import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'

// Build the Firebase config from Vite environment variables.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

// Validate required variables before initializing Firebase.
const requiredEnvVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
]

const missingEnvVars = requiredEnvVars.filter((variable) => !import.meta.env[variable])

let app = null
let auth = null
let firebaseError = null

// Initialize Firebase only when the required configuration exists.
if (missingEnvVars.length === 0) {
  try {
    app = initializeApp(firebaseConfig)
    auth = getAuth(app)
  } catch (error) {
    firebaseError = error instanceof Error ? error.message : 'Failed to initialize Firebase.'
  }
} else {
  firebaseError = 'Missing Firebase environment variables.'
}

// Export a simple flag so the app can show a graceful configuration screen.
export const isFirebaseConfigured = Boolean(auth && !firebaseError && missingEnvVars.length === 0)

// Export the auth instance and error details for the rest of the app.
export { auth, firebaseError, missingEnvVars }
