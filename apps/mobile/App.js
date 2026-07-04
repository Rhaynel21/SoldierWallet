import { useEffect, useState } from 'react'
import { StatusBar } from 'expo-status-bar'
import { NavigationContainer } from '@react-navigation/native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import * as SplashScreenNative from 'expo-splash-screen'

import { WalletProvider, useWallet } from './src/store/WalletContext.js'
import RootNavigator from './src/navigation/RootNavigator.js'
import SplashScreen from './src/screens/SplashScreen.js'
import AuthScreen from './src/screens/AuthScreen.js'
import LocationTracker from './src/components/LocationTracker.js'

SplashScreenNative.preventAutoHideAsync().catch(() => {})

function Root() {
  const { authedId, hydrated } = useWallet()
  const [splash, setSplash] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setSplash(false), 1900)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (hydrated) SplashScreenNative.hideAsync().catch(() => {})
  }, [hydrated])

  if (!hydrated || splash) {
    return <SplashScreen />
  }

  if (!authedId) {
    return <AuthScreen />
  }

  return (
    <NavigationContainer>
      <LocationTracker />
      <RootNavigator />
    </NavigationContainer>
  )
}

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <WalletProvider>
        <Root />
      </WalletProvider>
    </SafeAreaProvider>
  )
}
