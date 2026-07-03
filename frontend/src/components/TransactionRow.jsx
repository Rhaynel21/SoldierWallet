import { peso, shortDate } from '../utils/format.js'

const meta = {
  'cash-in': { icon: '↓', tint: 'green' },
  'ewallet-transfer': { icon: '↑', tint: 'blue' },
  'bank-transfer': { icon: '🏦', tint: 'blue' },
  'benefit-payment': { icon: '🏥', tint: 'red' },
  'benefit-grant': { icon: '🛡️', tint: 'gold' },
  receive: { icon: '↓', tint: 'green' },
  'qr-payment': { icon: '🏪', tint: 'blue' },
  commute: { icon: '🚌', tint: 'gold' },
}

export default function TransactionRow({ tx }) {
  const m = meta[tx.type] || { icon: '•', tint: 'blue' }
  const sign = tx.direction === 'in' ? '+' : '−'
  return (
    <div className="tx-row">
      <div className={`tx-icon tint-${m.tint}`}>{m.icon}</div>
      <div className="tx-body">
        <div className="tx-title">{tx.title}</div>
        <div className="tx-sub">
          {tx.subtitle ? `${tx.subtitle} • ` : ''}
          {shortDate(tx.date)}
        </div>
      </div>
      <div className={`tx-amount ${tx.direction === 'in' ? 'in' : 'out'}`}>
        {sign} {peso(tx.amount)}
      </div>
    </div>
  )
}
