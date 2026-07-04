import { peso, shortDate } from '../utils/format.js'

// Human label per transaction type (falls back to a stored tx.label, then a default).
const LABELS = {
  'cash-in': 'Cash In',
  'ewallet-transfer': 'E-Wallet',
  'bank-transfer': 'Bank',
  'benefit-payment': 'Benefits',
  'benefit-grant': 'Benefits',
  receive: 'Received',
  'qr-payment': 'QR Pay',
  commute: 'Commute',
}

export default function TransactionRow({ tx }) {
  const sign = tx.direction === 'in' ? '+' : '−'
  const label = tx.label || LABELS[tx.type] || 'Transaction'
  return (
    <div className="tx-row">
      <div className="tx-body">
        <div className="tx-title">{tx.title}</div>
        <div className="tx-sub">
          <span className={`tx-label label-${tx.direction === 'in' ? 'in' : 'out'}`}>{label}</span>
          {tx.subtitle ? ` ${tx.subtitle} • ` : ' '}
          {shortDate(tx.date)}
        </div>
        <div className="tx-id">ID: {tx.id}</div>
      </div>
      <div className={`tx-amount ${tx.direction === 'in' ? 'in' : 'out'}`}>
        {sign} {peso(tx.amount)}
      </div>
    </div>
  )
}
