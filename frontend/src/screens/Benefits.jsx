import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { useWallet } from '../store/WalletContext.jsx'
import { peso, shortDate } from '../utils/format.js'

// Benefits can be spent across many accredited categories, not just medical.
const categories = [
  {
    key: 'Medical',
    icon: '🏥',
    label: 'Medical & Hospital',
    merchants: [
      'AFP Medical Center (V. Luna)',
      'St. Luke’s Medical Center',
      'Philippine General Hospital',
      'Makati Medical Center',
    ],
  },
  {
    key: 'Pharmacy',
    icon: '💊',
    label: 'Pharmacy & Medicine',
    merchants: ['Mercury Drug', 'Watsons', 'Rose Pharmacy', 'Southstar Drug'],
  },
  {
    key: 'Groceries',
    icon: '🛒',
    label: 'Groceries & Supermarket',
    merchants: ['SM Supermarket', 'Puregold', 'Robinsons Supermarket', 'AFP Commissary'],
  },
  {
    key: 'Education',
    icon: '🎓',
    label: 'Education & Tuition',
    merchants: ['AFP Educational Benefit', 'University of the Philippines', 'PUP', 'Local School'],
  },
  {
    key: 'Fuel & Transport',
    icon: '⛽',
    label: 'Fuel & Transport',
    merchants: ['Petron', 'Shell', 'Caltex', 'Grab / Transport'],
  },
  {
    key: 'Utilities',
    icon: '💡',
    label: 'Utilities & Bills',
    merchants: ['Meralco', 'Maynilad', 'PLDT', 'Converge'],
  },
]

export default function Benefits() {
  const { benefits, vouchers, user, createVoucher, redeemVoucher, cancelVoucher } =
    useWallet()
  const navigate = useNavigate()

  const [catKey, setCatKey] = useState(categories[0].key)
  const [merchant, setMerchant] = useState(categories[0].merchants[0])
  const [amount, setAmount] = useState('')

  const category = categories.find((c) => c.key === catKey)
  const active = vouchers.filter((v) => v.status === 'active')
  const amt = Number(amount)
  const valid = amt > 0 && amt <= benefits

  function pickCategory(key) {
    const c = categories.find((x) => x.key === key)
    setCatKey(key)
    setMerchant(c.merchants[0])
  }

  function generate(e) {
    e.preventDefault()
    if (!valid) return
    createVoucher({ amount: amt, category: catKey, merchant })
    setAmount('')
  }

  return (
    <div className="page">
      <div className="page-top">
        <button className="back" onClick={() => navigate('/')}>‹</button>
        <h2>Benefits</h2>
      </div>

      <section className="benefit-hero">
        <div className="benefit-hero-label">Available Benefits</div>
        <div className="benefit-hero-amount">{peso(benefits)}</div>
        <div className="benefit-hero-sub">
          Spend your benefits at accredited partners — hospitals, pharmacies,
          groceries, schools, fuel and bills. Present a QR to pay.
        </div>
      </section>

      <section>
        <h3 className="section-title">What can I use it for?</h3>
        <div className="cat-grid">
          {categories.map((c) => (
            <button
              key={c.key}
              className={c.key === catKey ? 'cat active' : 'cat'}
              onClick={() => pickCategory(c.key)}
            >
              <span className="cat-icon">{c.icon}</span>
              <span className="cat-label">{c.label}</span>
            </button>
          ))}
        </div>
      </section>

      {active.length > 0 && (
        <section className="voucher-section">
          <h3 className="section-title">Ready to Present</h3>
          {active.map((v) => (
            <VoucherCard
              key={v.id}
              voucher={v}
              user={user}
              onRedeem={() => redeemVoucher({ id: v.id })}
              onCancel={() => cancelVoucher({ id: v.id })}
            />
          ))}
        </section>
      )}

      <form className="form card-form" onSubmit={generate}>
        <h3 className="section-title">
          {category.icon} Generate {category.key} QR
        </h3>
        <label className="field">
          <span>Accredited partner</span>
          <select value={merchant} onChange={(e) => setMerchant(e.target.value)}>
            {category.merchants.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Amount to authorize</span>
          <div className="amount-input">
            <span className="peso">₱</span>
            <input
              inputMode="decimal"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          {amt > benefits && <small className="error">Exceeds available benefits</small>}
        </label>
        <button type="submit" className="btn red big" disabled={!valid}>
          Generate QR
        </button>
      </form>
    </div>
  )
}

function VoucherCard({ voucher, user, onRedeem, onCancel }) {
  const payload = JSON.stringify({
    t: 'SOLDIER_BENEFIT',
    voucher: voucher.id,
    sn: user.serialNo,
    soldier: user.name,
    amount: voucher.amount,
    category: voucher.category,
    merchant: voucher.merchant,
    issued: voucher.createdAt,
  })

  return (
    <div className="voucher">
      <div className="qr-wrap">
        <QRCodeSVG
          value={payload}
          size={196}
          level="M"
          bgColor="#ffffff"
          fgColor="#12128f"
          includeMargin
        />
      </div>
      <div className="voucher-meta">
        <div className="voucher-amount">{peso(voucher.amount)}</div>
        <div className="voucher-cat">{voucher.category}</div>
        <div className="voucher-hospital">{voucher.merchant}</div>
        <div className="voucher-id">Voucher {voucher.id}</div>
        <div className="voucher-time">Issued {shortDate(voucher.createdAt)}</div>
      </div>
      <p className="voucher-hint">
        📷 Ask the cashier to scan this QR to charge your benefits.
      </p>
      <div className="voucher-actions">
        <button className="btn primary" onClick={onRedeem}>
          Simulate partner scan
        </button>
        <button className="btn ghost" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  )
}
