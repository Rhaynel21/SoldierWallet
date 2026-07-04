import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWallet } from '../store/WalletContext.jsx'
import { peso, shortDate } from '../utils/format.js'

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

export default function Reports() {
  const { allAccounts, role } = useWallet()
  const navigate = useNavigate()

  const r = useMemo(() => {
    const accts = allAccounts || []
    const sum = (arr, f) => arr.reduce((s, x) => s + (f ? f(x) : x), 0)
    const audit = accts
      .flatMap((a) =>
        (a.transactions || []).map((t) => ({
          ...t,
          owner: a.name,
          rank: a.rank,
          label: t.label || LABELS[t.type] || 'Transaction',
        })),
      )
      .sort((a, b) => new Date(b.date) - new Date(a.date))
    const benefitOut = audit.filter((t) => t.wallet === 'benefits' && t.direction === 'out')
    const byCat = {}
    for (const t of benefitOut) byCat[t.label] = (byCat[t.label] || 0) + t.amount
    return {
      totalUsers: accts.length,
      totalCash: sum(accts, (a) => a.cash || 0),
      totalBenefits: sum(accts, (a) => a.benefits || 0),
      totalTx: audit.length,
      benefitsDisbursed: sum(benefitOut, (t) => t.amount),
      cashIn: sum(audit.filter((t) => t.wallet === 'cash' && t.direction === 'in'), (t) => t.amount),
      cashOut: sum(audit.filter((t) => t.wallet === 'cash' && t.direction === 'out'), (t) => t.amount),
      categories: Object.entries(byCat).sort((a, b) => b[1] - a[1]),
      audit,
      accts: accts.slice().sort((a, b) => (b.benefits || 0) - (a.benefits || 0)),
    }
  }, [allAccounts])

  const [filter, setFilter] = useState('all')
  const filters = ['all', ...Array.from(new Set(r.audit.map((t) => t.label)))]
  const shownAudit = filter === 'all' ? r.audit : r.audit.filter((t) => t.label === filter)

  function exportCSV() {
    const header = [
      'Date',
      'Account',
      'Rank',
      'Type',
      'Label',
      'Wallet',
      'Direction',
      'Amount',
      'TransactionID',
      'Title',
    ]
    const esc = (v) => {
      const s = String(v ?? '')
      return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s
    }
    const lines = [header.join(',')]
    for (const t of shownAudit) {
      lines.push(
        [t.date, t.owner, t.rank, t.type, t.label, t.wallet, t.direction, t.amount, t.id, t.title]
          .map(esc)
          .join(','),
      )
    }
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `saludo-audit-trail-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const cards = [
    { label: 'Soldiers', value: String(r.totalUsers) },
    { label: 'Total Cash', value: peso(r.totalCash) },
    { label: 'Total Benefits', value: peso(r.totalBenefits) },
    { label: 'Transactions', value: String(r.totalTx) },
    { label: 'Benefits Disbursed', value: peso(r.benefitsDisbursed) },
    { label: 'Cash In / Out', value: `${peso(r.cashIn)} / ${peso(r.cashOut)}` },
  ]

  return (
    <div className="page">
      <div className="page-top">
        <button className="back" onClick={() => navigate('/')}>‹</button>
        <h2>Reports</h2>
      </div>

      <div className="report-banner">
        <span className="report-role">{role === 'superadmin' ? 'SUPERADMIN' : 'ADMIN'}</span>
        System-wide overview across all {r.totalUsers} accounts.
      </div>

      <div className="report-actions">
        <button className="btn primary" onClick={exportCSV}>⬇ Export CSV</button>
        <button className="btn ghost" onClick={() => window.print()}>🖨 Print</button>
      </div>

      <div className="report-grid">
        {cards.map((c) => (
          <div className="report-card" key={c.label}>
            <div className="report-card-label">{c.label}</div>
            <div className="report-card-value">{c.value}</div>
          </div>
        ))}
      </div>

      <h3 className="report-section-title">Benefits by Category</h3>
      <div className="profile-list">
        {r.categories.length === 0 && <p className="empty">No benefit spending yet.</p>}
        {r.categories.map(([cat, amt]) => (
          <div className="profile-row" key={cat}>
            <span className="profile-row-label">
              <span className="tx-label label-out">{cat}</span>
            </span>
            <span className="profile-row-value">{peso(amt)}</span>
          </div>
        ))}
      </div>

      <h3 className="report-section-title">Accounts</h3>
      <div className="profile-list">
        {r.accts.map((a) => (
          <div className="profile-row" key={a.id}>
            <span className="profile-row-label">
              <b>{a.name}</b>
              <br />
              {a.rank}
              {a.role && a.role !== 'user' ? ` · ${a.role}` : ''}
            </span>
            <span className="profile-row-value">
              Cash {peso(a.cash || 0)}
              <br />
              Benefits {peso(a.benefits || 0)}
            </span>
          </div>
        ))}
      </div>

      <h3 className="report-section-title">Soldier Locations</h3>
      <div className="profile-list">
        {r.accts.filter((a) => (a.role || 'user') === 'user').length === 0 && (
          <p className="empty">No soldiers yet.</p>
        )}
        {r.accts
          .filter((a) => (a.role || 'user') === 'user')
          .map((a) => (
            <div className="profile-row" key={a.id}>
              <span className="profile-row-label">
                <b>{a.name}</b>
                <br />
                {a.location
                  ? `${a.location.lat.toFixed(5)}, ${a.location.lng.toFixed(5)}`
                  : 'No location yet'}
                {a.location?.updatedAt ? (
                  <>
                    <br />
                    <span className="audit-meta">Updated {shortDate(a.location.updatedAt)}</span>
                  </>
                ) : null}
              </span>
              <span className="profile-row-value">
                {a.location ? (
                  <a
                    className="map-link"
                    href={`https://www.google.com/maps?q=${a.location.lat},${a.location.lng}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    View map ›
                  </a>
                ) : (
                  '—'
                )}
              </span>
            </div>
          ))}
      </div>

      <h3 className="report-section-title">
        Audit Trail <span className="report-count">{shownAudit.length} entries</span>
      </h3>
      <div className="report-filters">
        {filters.map((f) => (
          <button
            key={f}
            className={filter === f ? 'report-chip active' : 'report-chip'}
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? 'All' : f}
          </button>
        ))}
      </div>
      <div className="audit-list">
        {shownAudit.length === 0 && <p className="empty">No transactions in this category.</p>}
        {shownAudit.map((t) => (
          <div className="audit-row" key={t.id}>
            <div className="audit-main">
              <div className="audit-top">
                <span className={`tx-label label-${t.direction === 'in' ? 'in' : 'out'}`}>
                  {t.label}
                </span>
                <span className="audit-owner">{t.owner}</span>
              </div>
              <div className="audit-title">{t.title}</div>
              <div className="audit-meta">
                {shortDate(t.date)} · ID {t.id}
              </div>
            </div>
            <div className={`tx-amount ${t.direction === 'in' ? 'in' : 'out'}`}>
              {t.direction === 'in' ? '+' : '−'} {peso(t.amount)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
