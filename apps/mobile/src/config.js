// App-wide runtime config, read from EXPO_PUBLIC_* env vars (see .env.example).

export const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain:
    process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || 'soldierwallet-16c61.firebaseapp.com',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || 'soldierwallet-16c61',
  storageBucket:
    process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || 'soldierwallet-16c61.appspot.com',
  messagingSenderId:
    process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '896637134400',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
}

// Base URL of the OTP backend (../backend). Empty string disables OTP.
export const API_BASE = (process.env.EXPO_PUBLIC_API_BASE || '').replace(/\/$/, '')
export const otpEnabled = Boolean(API_BASE)
