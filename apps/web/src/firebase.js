// Firebase initialization for SALUDO (web)
// Project: soldierwallet-16c61
//
// The web config below is read from Vite env vars (apps/web/.env).
// A Firebase *web* app config is required (the Android app shown in the
// console cannot be used by this React web app). See .env.example.
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'soldierwallet-16c61.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'soldierwallet-16c61',
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'soldierwallet-16c61.appspot.com',
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '896637134400',
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

// True only when the required web credentials are present.
export const firebaseEnabled = Boolean(firebaseConfig.apiKey && firebaseConfig.appId)

export const app = firebaseEnabled ? initializeApp(firebaseConfig) : null
export const db = firebaseEnabled ? getFirestore(app) : null
export const auth = firebaseEnabled ? getAuth(app) : null
