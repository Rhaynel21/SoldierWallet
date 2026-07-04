import { Routes, Route, Navigate } from 'react-router-dom'
import BottomNav from './components/BottomNav.jsx'
import Home from './screens/Home.jsx'
import Send from './screens/Send.jsx'
import Benefits from './screens/Benefits.jsx'
import History from './screens/History.jsx'
import QR from './screens/QR.jsx'
import Profile from './screens/Profile.jsx'
import Auth from './screens/Auth.jsx'
import Splash from './screens/Splash.jsx'
import Reports from './screens/Reports.jsx'
import { useWallet } from './store/WalletContext.jsx'
import { useEffect, useState } from 'react'

export default function App() {
  const { authedId, role } = useWallet()
  const isAdmin = role === 'admin' || role === 'superadmin'
  const [splash, setSplash] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setSplash(false), 1900)
    return () => clearTimeout(t)
  }, [])

  if (splash) {
    return (
      <div className="phone">
        <Splash />
      </div>
    )
  }

  if (!authedId) {
    return (
      <div className="phone">
        <div className="screen no-pad">
          <Auth />
        </div>
      </div>
    )
  }

  return (
    <div className="phone">
      <div className="screen">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/send" element={<Send />} />
          <Route path="/qr" element={<QR />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/benefits" element={<Benefits />} />
          <Route path="/history" element={<History />} />
          <Route
            path="/reports"
            element={isAdmin ? <Reports /> : <Navigate to="/" replace />}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <BottomNav />
    </div>
  )
}
