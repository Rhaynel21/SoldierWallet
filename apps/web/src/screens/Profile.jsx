import { useNavigate } from 'react-router-dom'
import { useWallet } from '../store/WalletContext.jsx'
import { peso } from '../utils/format.js'

export default function Profile() {
  const { user, cash, benefits, transactions, logout } = useWallet()
  const navigate = useNavigate()

  const rows = [
    { label: 'Account No.', value: user.accountNo },
    { label: 'Mobile No.', value: user.mobile },
    { label: 'Serial No.', value: user.serialNo },
    { label: 'Rank', value: user.rank },
    { label: 'Unit', value: user.unit },
    { label: 'Transactions', value: String(transactions.length) },
  ]

  return (
    <div className="page">
      <div className="page-top">
        <button className="back" onClick={() => navigate('/')}>‹</button>
        <h2>Profile</h2>
      </div>

      <div className="profile-head">
        <div className="profile-avatar">{user.name.split(' ').slice(-1)[0][0]}</div>
        <div className="profile-name">{user.name}</div>
        <div className="profile-rank">{user.rank} · {user.unit}</div>
      </div>

      <div className="profile-balances">
        <div className="profile-bal cash">
          <div className="profile-bal-label">Cash Wallet</div>
          <div className="profile-bal-value">{peso(cash)}</div>
        </div>
        <div className="profile-bal benefits">
          <div className="profile-bal-label">Benefits</div>
          <div className="profile-bal-value">{peso(benefits)}</div>
        </div>
      </div>

      <div className="profile-list">
        {rows.map((r) => (
          <div className="profile-row" key={r.label}>
            <span className="profile-row-label">{r.label}</span>
            <span className="profile-row-value">{r.value}</span>
          </div>
        ))}
      </div>

      <button className="profile-logout" onClick={logout}>
        Log out
      </button>
    </div>
  )
}
