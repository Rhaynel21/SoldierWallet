import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import jsQR from 'jsqr'
import { useWallet } from '../store/WalletContext.jsx'
import { peso } from '../utils/format.js'

export default function QR() {
  const location = useLocation()
  const navigate = useNavigate()
  const [mode, setMode] = useState(location.state?.mode || 'scan')

  if (mode === 'menu')
    return <Menu onPick={setMode} onHome={() => setMode('scan')} navigate={navigate} />
  if (mode === 'receive') return <Receive onBack={() => setMode('menu')} />
  if (mode === 'pay') return <PayCode onBack={() => setMode('menu')} onScan={() => setMode('scan')} />
  if (mode === 'commute') return <Commute onBack={() => setMode('menu')} />

  return (
    <Scanner
      onBack={() => navigate('/')}
      onGenerate={() => setMode('menu')}
    />
  )
}

/* ---------- Landing menu (My QR Code) ---------- */
const ScanGlyph = ({ variant }) => (
  <span className={`qrg qrg-${variant}`}>
    <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3" strokeLinecap="round" />
      <rect x="8" y="8" width="3" height="3" rx="0.6" />
      <rect x="13" y="8" width="3" height="3" rx="0.6" />
      <rect x="8" y="13" width="3" height="3" rx="0.6" />
    </svg>
  </span>
)

function Menu({ onPick, onHome, navigate }) {
  const items = [
    {
      key: 'pay',
      variant: 'blue',
      title: 'Pay using QR Code',
      desc: 'Show your code to the cashier to pay for your purchases.',
    },
    {
      key: 'receive',
      variant: 'light',
      title: 'Receive money via QR Code',
      desc: 'Share this code so anyone can send you money via e-wallet or bank.',
    },
    {
      key: 'benefits',
      variant: 'red',
      title: 'Benefits QR',
      desc: 'Pay hospitals & accredited partners using your benefits.',
    },
  ]
  return (
    <div className="page">
      <div className="page-top">
        <button className="back" onClick={onHome}>‹</button>
        <h2>My QR Code</h2>
      </div>

      <h2 className="qr-menu-heading">
        Generate a QR Code to pay for a purchase or request money.
      </h2>

      <div className="qr-menu-card">
        {items.map((it) => (
          <button
            key={it.key}
            className="qr-menu-row"
            onClick={() => (it.key === 'benefits' ? navigate('/benefits') : onPick(it.key))}
          >
            <ScanGlyph variant={it.variant} />
            <span className="qr-menu-text">
              <span className="qr-menu-title">{it.title}</span>
              <span className="qr-menu-desc">{it.desc}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

/* ---------- Receive money (My QR) ---------- */
function Receive({ onBack }) {
  const { user, cash, receiveMoney } = useWallet()
  const [amount, setAmount] = useState('')
  const [editing, setEditing] = useState(false)

  const amt = Number(amount)
  const payload = JSON.stringify({
    t: 'SOLDIER_RECEIVE',
    sn: user.serialNo,
    name: user.name,
    amount: amt > 0 ? amt : undefined,
  })
  const maskedName = user.name.replace(/(?<=.{4}).(?=.*.{2})/g, '*')

  return (
    <div className="qr-screen">
      <div className="qr-topbar">
        <button className="qr-back" onClick={onBack}>‹</button>
        <span className="qr-topbar-title">My QR</span>
        <span className="qr-topbar-info">ⓘ</span>
      </div>

      <div className="myqr-card">
        <div className="qr-with-badge">
          <QRCodeSVG value={payload} size={210} level="H" fgColor="#0a1a4f" />
          <span className="instapay-badge">
            <b>insta</b>
            <i>Pay</i>
          </span>
        </div>
        <p className="myqr-fee">Transfer fees may apply.</p>

        <div className="myqr-name">
          {maskedName} <button className="pencil" onClick={() => setEditing((e) => !e)}>✎</button>
        </div>
        <div className="myqr-field">
          <span>Mobile No.:</span> <b>0945&nbsp;533&nbsp;••••</b>
        </div>
        <div className="myqr-field">
          <span>User ID:</span> <b>••••••••{user.serialNo.slice(-6)}</b>
        </div>

        <div className="myqr-divider" />

        <p className="myqr-specify">Specify an amount upon scanning your QR code.</p>
        {editing && (
          <div className="amount-input myqr-amount">
            <span className="peso">₱</span>
            <input
              inputMode="decimal"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              autoFocus
            />
          </div>
        )}
        {!editing ? (
          <button className="add-amount-btn" onClick={() => setEditing(true)}>
            Add amount
          </button>
        ) : (
          <button className="add-amount-btn filled" onClick={() => setEditing(false)}>
            {amt > 0 ? `Set ${peso(amt)}` : 'Done'}
          </button>
        )}
      </div>

      <div className="myqr-actions">
        <button onClick={() => receiveMoney({ amount: amt > 0 ? amt : 100, from: 'Juan (demo)' })}>
          ⬇ Simulate receive
        </button>
        <button onClick={() => navigator.share?.({ text: 'My SALUDO QR' })}>
          ⤴ Share QR
        </button>
      </div>
      <p className="qr-foot-note">Cash Wallet balance: {peso(cash)}</p>
    </div>
  )
}

/* Fake barcode rendered as solid bars (no gradient). */
const BAR_WIDTHS = [2, 1, 3, 1, 2, 1, 1, 3, 2, 1, 2, 1, 3, 1, 1, 2, 1, 3, 2, 1, 1, 2, 3, 1, 2, 1, 1, 2, 1, 3]
function Barcode() {
  return (
    <div className="barcode">
      {BAR_WIDTHS.map((w, i) => (
        <span
          key={i}
          style={{ width: w * 3, background: i % 2 === 0 ? '#0a1a4f' : '#fff' }}
        />
      ))}
    </div>
  )
}

/* ---------- Pay using QR (show code to cashier) ---------- */
function PayCode({ onBack, onScan }) {
  const { user, cash, benefits, payMerchant } = useWallet()
  const [wallet, setWallet] = useState('cash')
  const balance = wallet === 'cash' ? cash : benefits

  const payload = JSON.stringify({
    t: 'SOLDIER_PAY',
    sn: user.serialNo,
    wallet,
  })

  function simulateCharge() {
    const val = Number(prompt('Cashier charges amount (₱):', '150'))
    if (val > 0 && val <= balance) payMerchant({ amount: val, merchant: 'Participating store' })
    else if (val > balance) alert('Insufficient balance')
  }

  return (
    <div className="qr-screen">
      <div className="qr-topbar">
        <button className="qr-back" onClick={onBack}>‹</button>
        <span className="qr-topbar-title">Pay QR / Barcode</span>
        <span className="qr-topbar-info">↻</span>
      </div>

      <div className="paycard">
        <div className="paycard-head">
          <div>
            <div className="paywith-label">Pay with</div>
            <div className="paywith-wallet">{wallet === 'cash' ? 'Cash Wallet' : 'Benefits'}</div>
          </div>
          <button
            className="change-btn"
            onClick={() => setWallet((w) => (w === 'cash' ? 'benefits' : 'cash'))}
          >
            Change
          </button>
        </div>
        <div className="paycard-body">
          <Barcode />
          <div className="barcode-num">••••••{user.serialNo.slice(-4)} · View Numbers</div>
          <QRCodeSVG value={payload} size={188} level="M" fgColor="#0a1a4f" />
        </div>
        <div className="paycard-foot" onClick={simulateCharge}>
          Your payment will be charged automatically. <b>(tap to simulate)</b>
        </div>
      </div>

      <p className="paycard-caption">
        Show this to the cashier of any participating store in the Philippines.
      </p>
      <p className="paycard-bal">Balance: {peso(balance)}</p>

      <button className="scan-link" onClick={onScan}>
        <ScanGlyph variant="ghost" /> Scan QR code
      </button>
    </div>
  )
}

/* ---------- Scanner (QR Reader, real camera) ---------- */
function Scanner({ onBack, onGenerate }) {
  const { cash, payMerchant } = useWallet()
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const rafRef = useRef(0)
  const scanningRef = useRef(false)
  const fileInputRef = useRef(null)

  const [status, setStatus] = useState('starting') // starting | scanning | denied | unsupported
  const [result, setResult] = useState(null) // { raw, parsed }
  const [amount, setAmount] = useState('')
  const [paid, setPaid] = useState(null) // { amount, payee } once auto-charged

  useEffect(() => {
    let cancelled = false

    function loop() {
      const v = videoRef.current
      const c = canvasRef.current
      if (scanningRef.current && v && c && v.readyState === v.HAVE_ENOUGH_DATA) {
        const w = v.videoWidth
        const h = v.videoHeight
        if (w && h) {
          c.width = w
          c.height = h
          const ctx = c.getContext('2d', { willReadFrequently: true })
          ctx.drawImage(v, 0, 0, w, h)
          const img = ctx.getImageData(0, 0, w, h)
          const code = jsQR(img.data, w, h, { inversionAttempts: 'dontInvert' })
          if (code && code.data) {
            scanningRef.current = false
            let parsed = null
            try {
              parsed = JSON.parse(code.data)
            } catch {
              parsed = null
            }
            setResult({ raw: code.data, parsed })
          }
        }
      }
      rafRef.current = requestAnimationFrame(loop)
    }

    async function start() {
      if (!navigator.mediaDevices?.getUserMedia) {
        setStatus('unsupported')
        return
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false,
        })
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }
        streamRef.current = stream
        const v = videoRef.current
        v.srcObject = stream
        await v.play()
        scanningRef.current = true
        setStatus('scanning')
        rafRef.current = requestAnimationFrame(loop)
      } catch {
        setStatus('denied')
      }
    }

    start()
    return () => {
      cancelled = true
      scanningRef.current = false
      cancelAnimationFrame(rafRef.current)
      streamRef.current?.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
  }, [])

  // As soon as a QR carrying an amount is scanned, charge it (deduct) automatically.
  useEffect(() => {
    if (!result || paid) return
    const a = Number(result.parsed?.amount || 0)
    if (a > 0 && a <= cash) {
      const p = result.parsed?.name || result.parsed?.merchant || 'Merchant'
      payMerchant({ amount: a, merchant: p })
      setPaid({ amount: a, payee: p })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result])

  function decodeString(data) {
    scanningRef.current = false
    let parsed = null
    try {
      parsed = JSON.parse(data)
    } catch {
      parsed = null
    }
    setResult({ raw: data, parsed })
  }

  function handleUpload(e) {
    const file = e.target.files?.[0]
    e.target.value = '' // allow re-picking the same file
    if (!file) return
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      const c = document.createElement('canvas')
      c.width = img.naturalWidth
      c.height = img.naturalHeight
      const ctx = c.getContext('2d', { willReadFrequently: true })
      ctx.drawImage(img, 0, 0)
      const data = ctx.getImageData(0, 0, c.width, c.height)
      const code = jsQR(data.data, c.width, c.height, { inversionAttempts: 'attemptBoth' })
      URL.revokeObjectURL(url)
      if (code && code.data) {
        setAmount('')
        decodeString(code.data)
      } else {
        alert('Walang QR code na nakita sa larawan. Subukan ang mas malinaw na litrato.')
      }
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      alert('Hindi mabuksan ang larawan.')
    }
    img.src = url
  }

  // Derive a friendly payee name from the decoded QR
  const payee =
    result?.parsed?.name ||
    result?.parsed?.merchant ||
    (result ? `Merchant (${String(result.raw).slice(0, 16)}…)` : '')
  const prefill = result?.parsed?.amount
  const amt = Number(amount || prefill || 0)
  const valid = amt > 0 && amt <= cash

  return (
    <div className="scanner">
      <video ref={videoRef} className="scanner-video" playsInline muted />
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      <div className="scanner-overlay" />

      <div className="scanner-content">
        <div className="qr-topbar dark">
          <button className="qr-back" onClick={onBack}>‹</button>
          <span className="qr-topbar-title">QR Reader</span>
          <span className="qr-topbar-info">ⓘ</span>
        </div>

        <div className="scan-window">
          <span className="scan-corner tl" />
          <span className="scan-corner tr" />
          <span className="scan-corner bl" />
          <span className="scan-corner br" />
          {status === 'scanning' && !result && <span className="scan-line" />}
          <span className="scan-caption-hint">
            {status === 'scanning' && 'Point camera at a QR code'}
            {status === 'starting' && 'Starting camera…'}
            {status === 'denied' && 'Camera access denied'}
            {status === 'unsupported' && 'Camera not available'}
          </span>
        </div>

        {(status === 'denied' || status === 'unsupported') && (
          <p className="scan-hint-line">
            Payagan ang camera sa browser, o buksan sa HTTPS/localhost. Gamitin
            muna ang manual entry sa ibaba.
          </p>
        )}

        <div className="scanner-actions">
          <button className="scanner-act" onClick={onGenerate}>
            <span>＋</span>Generate QR
          </button>
          <button className="scanner-act" onClick={() => fileInputRef.current?.click()}>
            <span>⬆</span>Upload QR
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleUpload}
        />

        {paid && (
          <div className="scan-result">
            <div className="scan-result-badge">✓ Payment successful</div>
            <div className="scan-result-payee">{paid.payee}</div>
            <div className="success-amt" style={{ margin: '8px 0' }}>− {peso(paid.amount)}</div>
            <button className="btn primary big" onClick={onBack}>Done</button>
          </div>
        )}

        {result && !paid && (
          <div className="scan-result">
            <div className="scan-result-badge">✓ QR detected</div>
            <div className="scan-result-payee">{payee}</div>
            <div className="amount-input">
              <span className="peso">₱</span>
              <input
                inputMode="decimal"
                placeholder="0.00"
                value={amount || (prefill ? String(prefill) : '')}
                onChange={(e) => setAmount(e.target.value)}
                autoFocus
              />
            </div>
            <button
              className="btn primary big"
              disabled={!valid}
              onClick={() => {
                payMerchant({ amount: amt, merchant: payee })
                onBack()
              }}
            >
              Pay {amt > 0 ? peso(amt) : ''}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

/* ---------- Commute ---------- */
const fares = [
  { mode: 'Jeepney', fare: 13, icon: '🚐' },
  { mode: 'Bus', fare: 15, icon: '🚌' },
  { mode: 'MRT / LRT', fare: 25, icon: '🚆' },
  { mode: 'Tricycle', fare: 20, icon: '🛺' },
  { mode: 'Grab / Taxi', fare: 180, icon: '🚕' },
  { mode: 'UV Express', fare: 50, icon: '🚙' },
]

function Commute({ onBack }) {
  const { cash, payCommute } = useWallet()
  const navigate = useNavigate()
  const [done, setDone] = useState(null)

  if (done) {
    return (
      <div className="page">
        <div className="success" style={{ paddingTop: 30 }}>
          <div className="success-check">✓</div>
          <h2>Fare Paid</h2>
          <p className="success-amt">{peso(done.fare)}</p>
          <p className="success-sub">{done.mode} • Tap-and-go</p>
          <div className="success-actions">
            <button className="btn primary" onClick={() => navigate('/')}>Back to Home</button>
            <button className="btn ghost" onClick={() => setDone(null)}>Ride Again</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="page-top">
        <button className="back" onClick={onBack}>‹</button>
        <h2>Commute</h2>
      </div>
      <div className="balance-pill">Available: {peso(cash)}</div>
      <p className="section-title">Tap your QR to pay transport fare</p>
      <div className="fare-grid">
        {fares.map((f) => (
          <button
            key={f.mode}
            className="fare"
            disabled={f.fare > cash}
            onClick={() => {
              payCommute({ amount: f.fare, mode: f.mode })
              setDone(f)
            }}
          >
            <span className="fare-icon">{f.icon}</span>
            <span className="fare-mode">{f.mode}</span>
            <span className="fare-amt">{peso(f.fare)}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
