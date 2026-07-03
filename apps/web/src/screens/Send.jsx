import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useWallet } from '../store/WalletContext.jsx'
import { peso } from '../utils/format.js'
import Dropdown from '../components/Dropdown.jsx'

const ewallets = ['GCash', 'Maya', 'GrabPay', 'ShopeePay', 'Coins.ph']

// Local partner banks. `logo` is a filename in /public/bank-logos/<logo>.
// Drop each bank's official logo there (e.g. bdo.png) and it renders automatically;
// until then a brand-colored badge with `short` is shown.
const banks = [
  { key: 'BPI', name: 'BPI / VYBE by BPI', logo: 'bpi', short: 'BPI', color: '#a6192e' },
  { key: 'BDO', name: 'BDO Unibank, Inc.', logo: 'bdo', short: 'BDO', color: '#0033a0' },
  { key: 'Metrobank', name: 'Metropolitan Bank and Trust Co.', logo: 'metrobank', short: 'MB', color: '#0a2d8f' },
  { key: 'Landbank', name: 'LANDBANK / OFBank', logo: 'landbank', short: 'LBP', color: '#0a7d3c' },
  { key: 'Security Bank', name: 'Security Bank Corporation', logo: 'securitybank', short: 'SBC', color: '#c8102e' },
  { key: 'UnionBank', name: 'UnionBank of the Philippines', logo: 'unionbank', short: 'UB', color: '#ff6a13' },
  { key: 'PNB', name: 'Philippine National Bank', logo: 'pnb', short: 'PNB', color: '#0033a1' },
  { key: 'RCBC', name: 'Rizal Commercial Banking Corp.', logo: 'rcbc', short: 'RCBC', color: '#0055b8' },
  { key: 'China Bank', name: 'China Banking Corporation', logo: 'chinabank', short: 'CBC', color: '#d81e05' },
  { key: 'EastWest Bank', name: 'EastWest Bank', logo: 'eastwest', short: 'EW', color: '#003da5' },
  { key: 'PSBank', name: 'Philippine Savings Bank', logo: 'psbank', short: 'PSB', color: '#e4002b' },
  { key: 'DBP', name: 'Development Bank of the Philippines', logo: 'dbp', short: 'DBP', color: '#0038a8' },
  { key: 'AUB', name: 'Asia United Bank', logo: 'aub', short: 'AUB', color: '#003399' },
  { key: 'Maybank Philippines', name: 'Maybank Philippines, Inc.', logo: 'maybank', short: 'MAY', color: '#f5b301' },
  { key: 'GoTyme Bank', name: 'GoTyme Bank', logo: 'gotyme', short: 'GT', color: '#0e7c7b' },
  { key: 'CIMB Bank', name: 'CIMB Bank Philippines', logo: 'cimb', short: 'CIMB', color: '#7a0019' },
  { key: 'Tonik Bank', name: 'Tonik Digital Bank', logo: 'tonik', short: 'TON', color: '#e5006d' },
  { key: 'Maya Bank', name: 'Maya Bank, Inc.', logo: 'maya', short: 'MAYA', color: '#0aa06e' },
]

const BANK_FEE = 15
const BANK_MAX = 50000

export default function Send() {
  const location = useLocation()
  const [view, setView] = useState(location.state?.view || 'menu')

  if (view === 'express') return <Express onBack={() => setView('menu')} />
  if (view === 'bank') return <Bank onBack={() => setView('menu')} />
  return <Menu onPick={setView} />
}

/* Renders a bank's real logo (from /bank-logos), falling back to a brand badge. */
function BankLogo({ bank, size = 42 }) {
  const [failed, setFailed] = useState(false)
  if (failed || !bank.logo) {
    return (
      <span
        className="bank-logo"
        style={{ background: bank.color, color: '#fff', width: size, height: size }}
      >
        {bank.short}
      </span>
    )
  }
  return (
    <img
      className="bank-logo-img"
      style={{ width: size, height: size }}
      src={`/bank-logos/${bank.logo}.png`}
      alt={bank.name}
      onError={() => setFailed(true)}
    />
  )
}

/* ---------- Send menu (GCash-style) ---------- */
function Menu({ onPick }) {
  const navigate = useNavigate()
  return (
    <div className="page">
      <div className="page-top">
        <button className="back" onClick={() => navigate('/')}>‹</button>
        <h2>Send</h2>
      </div>

      <h3 className="send-section first">Send to any e-wallet account</h3>
      <button className="send-item" onClick={() => onPick('express')}>
        <span className="send-item-icon">➤</span>
        <span className="send-item-text">
          <span className="send-item-title">Express Send</span>
          <span className="send-item-desc">Send money quickly</span>
        </span>
      </button>

      <h3 className="send-section">Send through our partners</h3>
      <p className="send-help">
        Send to any of our 50+ partner banks all over the Philippines.
      </p>
      <button className="send-item" onClick={() => onPick('bank')}>
        <span className="send-item-icon">🏦</span>
        <span className="send-item-text">
          <span className="send-item-title">Bank Transfer</span>
          <span className="send-item-desc">Send cash to any bank account</span>
        </span>
      </button>

      <h3 className="send-section">Request money</h3>
      <button
        className="send-item"
        onClick={() => navigate('/qr', { state: { mode: 'receive' } })}
      >
        <span className="send-item-icon">⧉</span>
        <span className="send-item-text">
          <span className="send-item-title">Generate QR</span>
          <span className="send-item-desc">Request easily using your QR code</span>
        </span>
      </button>
    </div>
  )
}

/* ---------- Success ---------- */
function Success({ done, onNew, label }) {
  const navigate = useNavigate()
  return (
    <div className="page center-page">
      <div className="success">
        <div className="success-check">✓</div>
        <h2>{label} Successful</h2>
        <p className="success-amt">{peso(done.amount)}</p>
        <p className="success-sub">
          Sent to {done.name || done.account} · {done.provider}
        </p>
        <div className="success-actions">
          <button className="btn primary" onClick={() => navigate('/')}>
            Back to Home
          </button>
          <button className="btn ghost" onClick={onNew}>
            Send Again
          </button>
        </div>
      </div>
    </div>
  )
}

/* ---------- Express Send (e-wallet) ---------- */
const norm = (s) => String(s || '').replace(/[\s-]/g, '').toLowerCase()

function Express({ onBack }) {
  const { cash, sendMoney, accounts, currentId } = useWallet()
  const navigate = useNavigate()

  const [account, setAccount] = useState('')
  const [name, setName] = useState('')
  const [provider, setProvider] = useState(ewallets[0])
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [done, setDone] = useState(null)

  const amt = Number(amount)
  const insufficient = amt > cash
  const valid = amt > 0 && !insufficient && account.trim().length >= 4

  const q = norm(account)
  const matched =
    q.length >= 4
      ? accounts.find(
          (a) => a.id !== currentId && (norm(a.accountNo) === q || norm(a.mobile) === q),
        )
      : null

  function reset() {
    setDone(null)
    setAccount('')
    setName('')
    setAmount('')
    setNote('')
  }

  if (done) return <Success done={done} onNew={reset} label="Express Send" />

  return (
    <div className="page">
      <div className="page-top">
        <button className="back" onClick={onBack}>‹</button>
        <h2>Express Send</h2>
      </div>

      <div className="balance-pill">Available: {peso(cash)}</div>

      <div className="sendto-label">Send to</div>
      <div className="sendto-row">
        <span className="flag-select">
          <span className="ph-flag" aria-hidden />
          <span className="flag-caret">▾</span>
        </span>
        <input
          className="sendto-input"
          inputMode="numeric"
          placeholder="Enter name or number"
          value={account}
          onChange={(e) => setAccount(e.target.value)}
        />
        <span className="sendto-contacts" title="Contacts">👤</span>
      </div>

      <button className="scan-upload-link" onClick={() => navigate('/qr')}>
        <span className="qr-mini">⬚</span> Scan/Upload QR
      </button>

      {matched && (
        <div className="match-chip">
          ✓ {matched.name} · <b>SALUDO account</b> — matatanggap nila agad ang pera.
        </div>
      )}

      <form
        className="form"
        style={{ marginTop: 20 }}
        onSubmit={(e) => {
          e.preventDefault()
          if (!valid) return
          sendMoney({ channel: 'ewallet', provider, account, name, amount: amt, note })
          setDone({ provider, account, name, amount: amt })
        }}
      >
        <div className="field">
          <span>E-Wallet</span>
          <Dropdown value={provider} options={ewallets} onChange={setProvider} ariaLabel="E-Wallet" />
        </div>
        <label className="field">
          <span>Recipient name (optional)</span>
          <input placeholder="Juan Dela Cruz" value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label className="field">
          <span>Amount</span>
          <div className="amount-input">
            <span className="peso">₱</span>
            <input
              inputMode="decimal"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          {insufficient && <small className="error">Insufficient balance</small>}
        </label>
        <label className="field">
          <span>Note (optional)</span>
          <input placeholder="For…" value={note} onChange={(e) => setNote(e.target.value)} />
        </label>
        <button type="submit" className="btn primary big" disabled={!valid}>
          Send {amt > 0 ? peso(amt) : 'Money'}
        </button>
      </form>
    </div>
  )
}

/* ---------- Bank Transfer (GCash-style) ---------- */
function Bank({ onBack }) {
  const { cash, sendMoney, accounts, currentId } = useWallet()
  const navigate = useNavigate()

  const [step, setStep] = useState('pick') // pick | details
  const [query, setQuery] = useState('')
  const [bank, setBank] = useState(null)
  const [account, setAccount] = useState('')
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [receipt, setReceipt] = useState('')
  const [done, setDone] = useState(null)

  const amt = Number(amount)
  const accountDigits = account.replace(/\D/g, '')
  const insufficient = amt > cash
  const overMax = amt > BANK_MAX
  const valid =
    amt > 0 &&
    !insufficient &&
    !overMax &&
    accountDigits.length >= 10 &&
    accountDigits.length <= 14 &&
    name.trim().length > 0

  // Does this account number / name match a SALUDO account? (deposits internally)
  const digitsOnly = (s) => String(s || '').replace(/\D/g, '')
  const nameQ = name.trim().toLowerCase()
  const recipient =
    (accountDigits.length >= 4 &&
      accounts.find(
        (a) =>
          a.id !== currentId &&
          (digitsOnly(a.accountNo) === accountDigits || digitsOnly(a.mobile) === accountDigits),
      )) ||
    (nameQ.length >= 3 &&
      accounts.find((a) => a.id !== currentId && a.name.toLowerCase().includes(nameQ))) ||
    null

  function reset() {
    setDone(null)
    setAccount('')
    setName('')
    setAmount('')
    setReceipt('')
    setStep('pick')
  }

  if (done) return <Success done={done} onNew={reset} label="Bank Transfer" />

  // Step 1 — choose a bank
  if (step === 'pick') {
    const filtered = banks.filter((b) => b.name.toLowerCase().includes(query.trim().toLowerCase()))
    return (
      <div className="page">
        <div className="page-top">
          <button className="back" onClick={onBack}>‹</button>
          <h2>Bank Transfer</h2>
        </div>

        <div className="bank-search">
          <span className="bank-search-icon">🔍</span>
          <input
            placeholder="Search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <section className="bank-hero">
          <div>
            <div className="bank-hero-title">Easily transfer funds now!</div>
            <div className="bank-hero-sub">
              Send cash to any partner bank account across the Philippines.
            </div>
          </div>
          <div className="bank-hero-icon">🏛️</div>
        </section>

        <button className="bank-scan" onClick={() => navigate('/qr')}>
          <span className="bank-scan-icon">⬚</span>
          <span className="send-item-text">
            <span className="send-item-title">Scan/Upload Bank QR</span>
            <span className="send-item-desc">Bank transfer by scanning or uploading a QR code.</span>
          </span>
        </button>

        <p className="bank-list-label">Partner Banks</p>
        <div className="bank-list">
          {filtered.map((b) => (
            <button
              key={b.key}
              className="bank-row"
              onClick={() => {
                setBank(b)
                setStep('details')
              }}
            >
              <BankLogo bank={b} />
              <span className="bank-name">{b.name}</span>
              <span className="bank-chevron">›</span>
            </button>
          ))}
          {filtered.length === 0 && <p className="empty">Walang bank na tumugma.</p>}
        </div>
      </div>
    )
  }

  // Step 2 — enter transfer details
  return (
    <div className="page">
      <div className="page-top">
        <button className="back" onClick={() => setStep('pick')}>‹</button>
        <h2>Bank Transfer</h2>
      </div>

      <div className="bank-detail-head">
        <BankLogo bank={bank} size={40} />
        <div className="bank-detail-name">{bank.name}</div>
      </div>

      {recipient && (
        <div className="match-chip">
          ✓ Papasok kay <b>{recipient.name}</b> — SALUDO account. Matatanggap nila agad ang pera.
        </div>
      )}

      <form
        className="form"
        onSubmit={(e) => {
          e.preventDefault()
          if (!valid) return
          sendMoney({
            channel: 'bank',
            provider: bank.name,
            account,
            name,
            amount: amt,
            note: receipt ? `Receipt: ${receipt}` : '',
          })
          setDone({ provider: bank.name, account, name, amount: amt })
        }}
      >
        <label className="field">
          <span>Amount (Max of {peso(BANK_MAX)})</span>
          <div className="amount-input">
            <span className="peso">₱</span>
            <input
              inputMode="decimal"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <small className="bank-avail">Available balance: {peso(cash)}</small>
          {insufficient && <small className="error">Insufficient balance</small>}
          {overMax && !insufficient && <small className="error">Exceeds {peso(BANK_MAX)} limit</small>}
        </label>

        <label className="field">
          <span>Account Name</span>
          <input
            placeholder="Max of 50 characters"
            maxLength={50}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>

        <label className="field">
          <span>Account Number</span>
          <input
            inputMode="numeric"
            placeholder="10 to 14 digits"
            maxLength={14}
            value={account}
            onChange={(e) => setAccount(e.target.value.replace(/\D/g, ''))}
          />
        </label>

        <label className="field">
          <span>Send Receipt To (Optional)</span>
          <input
            inputMode="email"
            placeholder="name@email.com"
            value={receipt}
            onChange={(e) => setReceipt(e.target.value)}
          />
        </label>

        <p className="bank-fee">A {peso(BANK_FEE)} fee will be charged per transaction.</p>
        <button type="submit" className="btn primary big" disabled={!valid}>
          Send Money
        </button>
      </form>
    </div>
  )
}
