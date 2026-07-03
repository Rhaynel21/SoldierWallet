import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { useWallet } from '../store/WalletContext.jsx'
import { peso, shortDate } from '../utils/format.js'
import Dropdown from '../components/Dropdown.jsx'

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
  const navigate = useNavigate()
  const { benefits } = useWallet()
  const [openCat, setOpenCat] = useState(null)

  // Each category opens its own page (the QR generator for that category).
  if (openCat) {
    const category = categories.find((c) => c.key === openCat)
    return <CategoryPage category={category} onBack={() => setOpenCat(null)} />
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
            <button key={c.key} className="cat" onClick={() => setOpenCat(c.key)}>
              <span className="cat-icon">{c.icon}</span>
              <span className="cat-label">{c.label}</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}

/* ---------- Category page: generate & present the QR for one category ---------- */
function CategoryPage({ category, onBack }) {
  const { benefits, vouchers, user, createVoucher, cancelVoucher } = useWallet()
  const [merchant, setMerchant] = useState(category.merchants[0])
  const [amount, setAmount] = useState('')

  const amt = Number(amount)
  const valid = amt > 0 && amt <= benefits
  const active = vouchers.filter((v) => v.status === 'active' && v.category === category.key)

  function generate(e) {
    e.preventDefault()
    if (!valid) return
    createVoucher({ amount: amt, category: category.key, merchant })
    setAmount('')
  }

  return (
    <div className="page">
      <div className="page-top">
        <button className="back" onClick={onBack}>‹</button>
        <h2>
          {category.icon} {category.label}
        </h2>
      </div>

      <div className="balance-pill">Available: {peso(benefits)}</div>

      {active.length > 0 ? (
        <section className="voucher-section">
          <h3 className="section-title">Ready to Present</h3>
          {active.map((v) => (
            <VoucherCard
              key={v.id}
              voucher={v}
              user={user}
              onCancel={() => cancelVoucher({ id: v.id })}
            />
          ))}
        </section>
      ) : (
        <form className="form card-form" onSubmit={generate}>
          <h3 className="section-title">
            {category.icon} Generate {category.key} QR
          </h3>
          <div className="field">
            <span>Accredited partner</span>
            <Dropdown
              value={merchant}
              options={category.merchants}
              onChange={setMerchant}
              ariaLabel="Accredited partner"
            />
          </div>
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
      )}
    </div>
  )
}

function VoucherCard({ voucher, user, onCancel }) {
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
        <button className="btn ghost" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  )
}
