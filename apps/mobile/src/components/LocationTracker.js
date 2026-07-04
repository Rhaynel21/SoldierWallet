import { useEffect } from 'react'
import * as Location from 'expo-location'
import { doc, setDoc } from 'firebase/firestore'
import { useWallet } from '../store/WalletContext.js'
import { db, firebaseEnabled } from '../firebase.js'

// Captures the soldier's GPS location after login and saves it to their account
// (so the superadmin can see soldier locations in Reports). Renders nothing.
//
// Writes DIRECTLY to Firestore with { merge: true } so the location can never be
// dropped by the general write-through / snapshot-sync race; also updates local
// state so the app reflects it immediately.
export default function LocationTracker() {
  const { authedId, updateLocation } = useWallet()

  useEffect(() => {
    if (!authedId) return
    let cancelled = false

    async function capture() {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync()
        if (status !== 'granted' || cancelled) return
        const pos = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        })
        if (cancelled) return
        const location = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy ?? null,
          updatedAt: new Date().toISOString(),
        }
        updateLocation(location)
        if (firebaseEnabled && db) {
          setDoc(doc(db, 'accounts', authedId), { location }, { merge: true }).catch(() => {})
        }
      } catch {
        // ignore — location is best-effort
      }
    }

    capture()
    // Refresh every 5 minutes while the app is open.
    const id = setInterval(capture, 5 * 60 * 1000)
    return () => {
      cancelled = true
      clearInterval(id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authedId])

  return null
}
