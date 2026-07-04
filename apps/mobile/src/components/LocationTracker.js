import { useEffect } from 'react'
import * as Location from 'expo-location'
import { useWallet } from '../store/WalletContext.js'

// Captures the soldier's GPS location after login and saves it to their account
// (so the superadmin can see soldier locations in Reports). Renders nothing.
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
        updateLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          updatedAt: new Date().toISOString(),
        })
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
