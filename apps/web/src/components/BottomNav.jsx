import { NavLink } from 'react-router-dom'

const items = [
  { to: '/', label: 'Home', icon: HomeIcon, end: true },
  { to: '/benefits', label: 'Benefits', icon: ShieldIcon },
  { to: '/qr', label: 'QR', icon: QrIcon, center: true },
  { to: '/history', label: 'Activity', icon: ClockIcon },
  { to: '/profile', label: 'Profile', icon: UserIcon },
]

export default function BottomNav() {
  return (
    <nav className="bottom-nav">
      {items.map(({ to, label, icon: Icon, end, center }) =>
        center ? (
          <NavLink key={to} to={to} className="nav-center">
            <span className="nav-center-btn">
              <Icon />
            </span>
            <span className="nav-center-label">{label}</span>
          </NavLink>
        ) : (
          <NavLink key={to} to={to} end={end} className="nav-item">
            {({ isActive }) => (
              <>
                <Icon active={isActive} />
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ),
      )}
    </nav>
  )
}

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 10.5 12 3l9 7.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 9.5V21h14V9.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function SendIcon() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function QrIcon() {
  return (
    <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3" strokeLinecap="round" />
      <rect x="8" y="8" width="3.2" height="3.2" rx="0.6" />
      <rect x="13" y="8" width="3.2" height="3.2" rx="0.6" />
      <rect x="8" y="13" width="3.2" height="3.2" rx="0.6" />
    </svg>
  )
}
function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 3l7 3v5c0 5-3.5 8-7 10-3.5-2-7-5-7-10V6l7-3Z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="m9 12 2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 3.5-6 8-6s8 2 8 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
