import { peso, shortDate } from '../utils/format.js'

export default function TransactionRow({ tx }) {
  const sign = tx.direction === 'in' ? '+' : '−'
  return (
    <div className="tx-row">
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
