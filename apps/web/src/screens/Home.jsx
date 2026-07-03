import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWallet } from '../store/WalletContext.jsx'
import { peso } from '../utils/format.js'
import TransactionRow from '../components/TransactionRow.jsx'
import saludoLogo from '../assets/saludoLogo.js'

const actions = [
  { key: 'send', label: 'Send', to: '/send', icon: '➤' },
  { key: 'benefits', label: 'Benefits', to: '/benefits', icon: '🛡️' },
  { key: 'bank', label: 'Bank', to: '/send', view: 'bank', icon: '🏦' },
]

export default function Home() {
  const { user, cash, benefits, transactions, logout } = useWallet()
  const navigate = useNavigate()
  const [showCash, setShowCash] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)

  function handleAction(a) {
    const state = a.mode ? { mode: a.mode } : a.view ? { view: a.view } : undefined
    navigate(a.to, state ? { state } : undefined)
  }

  return (
    <div className="page home">
      <header className="home-header">
        <button className="header-id" onClick={() => setMenuOpen((o) => !o)}>
          <div className="avatar">
            <img src={saludoLogo} alt="SALUDO" className="avatar-logo" />
          </div>
          <div className="greeting">
            <div className="hello">
              Mabuhay, {user.rank}! <span className="switch-caret">▾</span>
            </div>
            <div className="serial">Account No. {user.accountNo || user.serialNo}</div>
          </div>
        </button>
      </header>

      {menuOpen && (
        <div className="acct-switcher">
          <div className="acct-menu-head">
            <div className="acct-avatar">
              <img src={saludoLogo} alt="SALUDO" className="avatar-logo" />
            </div>
            <div className="acct-info">
              <div className="acct-name">{user.name}</div>
              <div className="acct-no">{user.mobile}</div>
            </div>
          </div>
          <button className="acct-logout" onClick={() => logout()}>
            Log out
          </button>
        </div>
      )}

      <section className="wallet-card">
        <div className="wallet-card-top">
          <span className="wallet-label">Cash Wallet</span>
          <button className="eye" onClick={() => setShowCash((s) => !s)}>
            {showCash ? 'Hide' : 'Show'}
          </button>
        </div>
        <div className="wallet-balance">{showCash ? peso(cash) : '₱ ••••••'}</div>
        <div className="wallet-foot">
          <span>{user.unit}</span>
        </div>
      </section>

      <section className="benefit-strip" onClick={() => navigate('/benefits')}>
        <div className="benefit-icon">🛡️</div>
        <div className="benefit-info">
          <div className="benefit-label">Benefits Wallet</div>
          <div className="benefit-value">{peso(benefits)}</div>
        </div>
        <div className="benefit-cta">Use QR ›</div>
      </section>

      <section className="actions">
        {actions.map((a) => (
          <button key={a.key} className="action" onClick={() => handleAction(a)}>
            <span className="action-icon">{a.icon}</span>
            <span className="action-label">{a.label}</span>
          </button>
        ))}
      </section>

      <section className="recent">
        <div className="section-head">
          <h3>Recent Activity</h3>
          <button className="link" onClick={() => navigate('/history')}>
            See all
          </button>
        </div>
        <div className="tx-list">
          {transactions.slice(0, 5).map((tx) => (
            <TransactionRow key={tx.id} tx={tx} />
          ))}
        </div>
      </section>
    </div>
  )
}
