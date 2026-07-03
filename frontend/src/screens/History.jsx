import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWallet } from '../store/WalletContext.jsx'
import TransactionRow from '../components/TransactionRow.jsx'

const filters = [
  { key: 'all', label: 'All' },
  { key: 'cash', label: 'Cash' },
  { key: 'benefits', label: 'Benefits' },
]

export default function History() {
  const { transactions } = useWallet()
  const navigate = useNavigate()
  const [filter, setFilter] = useState('all')

  const list = useMemo(() => {
    if (filter === 'all') return transactions
    return transactions.filter((t) => t.wallet === filter)
  }, [transactions, filter])

  return (
    <div className="page">
      <div className="page-top">
        <button className="back" onClick={() => navigate('/')}>‹</button>
        <h2>Activity</h2>
      </div>

      <div className="segmented">
        {filters.map((f) => (
          <button
            key={f.key}
            className={filter === f.key ? 'seg active' : 'seg'}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="tx-list padded">
        {list.length === 0 && <p className="empty">No transactions yet.</p>}
        {list.map((tx) => (
          <TransactionRow key={tx.id} tx={tx} />
        ))}
      </div>
    </div>
  )
}
