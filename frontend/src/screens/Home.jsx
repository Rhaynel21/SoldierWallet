import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWallet } from '../store/WalletContext.jsx'
import { peso } from '../utils/format.js'
import TransactionRow from '../components/TransactionRow.jsx'

const actions = [
  { key: 'send', label: 'Transfer', to: '/send', icon: '➤' },
  { key: 'benefits', label: 'Benefits', to: '/benefits', icon: '🛡️' },
  { key: 'bank', label: 'Bank', to: '/send', icon: '🏦' },
]

export default function Home() {
  const { user, cash, benefits, transactions } = useWallet()
  const navigate = useNavigate()
  const [showCash, setShowCash] = useState(true)

  function handleAction(a) {
    navigate(a.to, a.mode ? { state: { mode: a.mode } } : undefined)
  }

  return (
    <div className="page home">
      <header className="home-header">
        <div className="avatar">{user.name.split(' ').slice(-1)[0][0]}</div>
        <div className="greeting">
          <div className="hello">Mabuhay, {user.rank}!</div>
          <div className="serial">SN {user.serialNo}</div>
        </div>
      </header>

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
          <span className="brand-chip">SoldierWallet</span>
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
