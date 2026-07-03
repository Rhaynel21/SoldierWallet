// Firebase for React Native (Expo). Uses the same project as the web app.
// Only Firestore is used (auth is a local PIN check against Firestore docs).
//
// Firestore's default transport (WebChannel) is unreliable on React Native /
// Hermes, so we force long-polling for a stable connection on devices.
import { initializeApp, getApps, getApp } from 'firebase/app'
import { initializeFirestore } from 'firebase/firestore'
import { firebaseConfig } from './config.js'

export const firebaseEnabled = Boolean(firebaseConfig.apiKey && firebaseConfig.appId)

let app = null
let db = null

if (firebaseEnabled) {
  app = getApps().length ? getApp() : initializeApp(firebaseConfig)
  db = initializeFirestore(app, {
    experimentalForceLongPolling: true,
  })
}

export { app, db }
