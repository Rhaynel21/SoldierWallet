import { Routes, Route, Navigate } from 'react-router-dom'
import BottomNav from './components/BottomNav.jsx'
import Home from './screens/Home.jsx'
import Send from './screens/Send.jsx'
import Benefits from './screens/Benefits.jsx'
import History from './screens/History.jsx'
import QR from './screens/QR.jsx'

export default function App() {
  return (
    <div className="phone">
      <div className="screen">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/send" element={<Send />} />
          <Route path="/qr" element={<QR />} />
          <Route path="/benefits" element={<Benefits />} />
          <Route path="/history" element={<History />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <BottomNav />
    </div>
  )
}
