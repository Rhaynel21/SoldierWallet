import { useState } from 'react'
import { useWallet } from '../store/WalletContext.jsx'
import Dropdown from '../components/Dropdown.jsx'
import PinInput from '../components/PinInput.jsx'
import Logo from '../components/Logo.jsx'
import LogoMark from '../components/LogoMark.jsx'

const ranks = [
  'Private',
  'Private First Class',
  'Corporal',
  'Sergeant',
  'Staff Sergeant',
  'Second Lieutenant',
  'First Lieutenant',
  'Captain',
]

// Normalize a +63 phone (user types 9XXXXXXXXX) to local 09XXXXXXXXX
function toLocalPhone(v) {
  const d = String(v).replace(/\D/g, '')
  if (d.startsWith('63')) return '0' + d.slice(2)
  if (d.startsWith('0')) return d
  if (d.length === 10 && d.startsWith('9')) return '0' + d
  return d
}

export default function Auth() {
  const { login, signup, lastPhone } = useWallet()
  const [mode, setMode] = useState('login')

  if (mode === 'signup') {
    return <SignupScreen signup={signup} onBack={() => setMode('login')} />
  }
  return <MpinLogin login={login} lastPhone={lastPhone} onSignup={() => setMode('signup')} />
}

/* ---------- GCash-style MPIN login ---------- */
function MpinLogin({ login, lastPhone, onSignup }) {
  const [phone, setPhone] = useState(lastPhone || '')
  const [pin, setPin] = useState('')
  const [changing, setChanging] = useState(false)
  const [error, setError] = useState('')

  function press(d) {
    if (pin.length >= 4) return
    const next = pin + d
    setPin(next)
    setError('')
    if (next.length === 4) {
      const res = login({ phone, pin: next })
      if (!res.ok) {
        setError(res.error)
        setPin('')
      }
    }
  }

  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'back']

  return (
    <div className="mpin">
      <div className="mpin-top">
        <div className="mpin-brand">
          <Logo size={46} white />
          <span>SALUDO</span>
        </div>
        <div className="mpin-hello">Welcome back!</div>

        {changing ? (
          <form
            className="mpin-phone editing"
            onSubmit={(e) => {
              e.preventDefault()
              setChanging(false)
            }}
          >
            <input
              inputMode="tel"
              autoFocus
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="09XX XXX XXXX"
            />
            <button type="submit" className="mpin-ok">OK</button>
          </form>
        ) : (
          <div className="mpin-phone">
            <span>{phone}</span>
            <button className="mpin-switch" onClick={() => setChanging(true)} title="Change number">
              ⇄
            </button>
          </div>
        )}

        <div className="mpin-enter">Enter your MPIN</div>
        <div className="mpin-dots">
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className={i < pin.length ? 'on' : ''} />
          ))}
        </div>
        {error && <div className="mpin-err">{error}</div>}

        <div className="mpin-warn">
          Never share your MPIN or OTP with anyone.
          <br />
          <span className="mpin-demo">Demo: 0945 533 1200 · MPIN 1234</span>
        </div>
      </div>

      <div className="mpin-pad">
        <div className="mpin-keys">
          {keys.map((k, i) =>
            k === '' ? (
              <span key={i} className="mpin-key blank" />
            ) : k === 'back' ? (
              <button
                key={i}
                className="mpin-key back"
                aria-label="Delete"
                onClick={() => setPin((p) => p.slice(0, -1))}
              >
                <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 6H9.5a2 2 0 0 0-1.5.7L3.5 12l4.5 5.3a2 2 0 0 0 1.5.7H20a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1Z" strokeLinejoin="round" />
                  <path d="m12 9.5 4 5M16 9.5l-4 5" strokeLinecap="round" />
                </svg>
              </button>
            ) : (
              <button key={i} className="mpin-key" onClick={() => press(k)}>
                {k}
              </button>
            ),
          )}
        </div>
        <div className="mpin-links">
          <button onClick={onSignup}>Sign up</button>
          <button onClick={() => alert('Makipag-ugnayan sa AFP Finance para i-reset ang MPIN.')}>
            Forgot MPIN?
          </button>
        </div>
      </div>
    </div>
  )
}

/* ---------- Sign up screen ---------- */
function SignupScreen({ signup, onBack }) {
  return (
    <div className="auth">
      <div className="auth-brand">
        <div className="auth-logo">
          <Logo size={72} />
        </div>
        <h1 className="auth-title">Create account</h1>
        <p className="auth-tagline">Mag-sign up gamit ang iyong phone number</p>
      </div>

      <div className="auth-card">
        <SignupForm signup={signup} />
      </div>

      <button className="link-btn auth-switch" onClick={onBack}>
        May account na? <b>Log in</b>
      </button>
    </div>
  )
}

function PhoneField({ value, onChange }) {
  return (
    <div className="field">
      <span>Phone number</span>
      <div className="sendto-row">
        <span className="flag-select">
          <span className="ph-flag" aria-hidden />
          <span className="flag-caret">+63</span>
        </span>
        <input
          className="sendto-input"
          inputMode="tel"
          placeholder="9XX XXX XXXX"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  )
}

function LoginForm({ login }) {
  const [phone, setPhone] = useState('')
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')

  function submit(e) {
    e.preventDefault()
    const res = login({ phone, pin })
    if (!res.ok) setError(res.error)
  }

  return (
    <form className="form" onSubmit={submit}>
      <PhoneField value={phone} onChange={(v) => { setPhone(v); setError('') }} />
      <div className="field">
        <span>4-digit PIN</span>
        <PinInput value={pin} onChange={(v) => { setPin(v); setError('') }} />
      </div>
      {error && <div className="auth-error">{error}</div>}
      <button
        type="submit"
        className="btn primary big"
        disabled={phone.trim().length < 10 || pin.length !== 4}
      >
        Log in
      </button>
    </form>
  )
}

function SignupForm({ signup }) {
  const [step, setStep] = useState('form') // form | otp
  const [name, setName] = useState('')
  const [rank, setRank] = useState(ranks[0])
  const [phone, setPhone] = useState('')
  const [pin, setPin] = useState('')
  const [confirm, setConfirm] = useState('')
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const localPhone = toLocalPhone(phone)
  const phoneOk = localPhone.length === 11 && localPhone.startsWith('09')
  const valid = name.trim() && phoneOk && pin.length === 4 && confirm.length === 4

  async function sendOtp(e) {
    e?.preventDefault()
    if (!phoneOk) {
      setError('Maling phone number.')
      return
    }
    if (pin !== confirm) {
      setError('Hindi magkatugma ang PIN.')
      return
    }
    setBusy(true)
    setError('')
    try {
      const r = await fetch('/api/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: localPhone }),
      })
      const data = await r.json()
      if (data.ok) {
        setStep('otp')
      } else {
        setError(data.error || 'Hindi ma-send ang OTP.')
      }
    } catch {
      setError('Hindi maabot ang OTP server. Tiyaking tumatakbo ang backend.')
    } finally {
      setBusy(false)
    }
  }

  async function verifyOtp(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const r = await fetch('/api/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: localPhone, code: otp }),
      })
      const data = await r.json()
      if (!data.ok) {
        setError(data.error || 'Maling code.')
        return
      }
      const res = signup({ name, rank, phone: localPhone, pin })
      if (!res.ok) setError(res.error)
    } catch {
      setError('Hindi maabot ang OTP server.')
    } finally {
      setBusy(false)
    }
  }

  if (step === 'otp') {
    return (
      <form className="form" onSubmit={verifyOtp}>
        <p className="otp-lead">
          Nagpadala kami ng verification code sa <b>{phone}</b> via SMS.
        </p>
        <label className="field">
          <span>Enter OTP</span>
          <input
            className="otp-input"
            inputMode="numeric"
            maxLength={6}
            placeholder="______"
            value={otp}
            onChange={(e) => { setOtp(e.target.value.replace(/\D/g, '')); setError('') }}
            autoFocus
          />
        </label>
        {error && <div className="auth-error">{error}</div>}
        <button type="submit" className="btn primary big" disabled={busy || otp.length < 4}>
          {busy ? 'Verifying…' : 'Verify & Create account'}
        </button>
        <button type="button" className="btn ghost" onClick={sendOtp} disabled={busy}>
          Resend code
        </button>
        <button
          type="button"
          className="link-btn"
          onClick={() => { setStep('form'); setOtp(''); setError('') }}
        >
          ‹ Baguhin ang details
        </button>
      </form>
    )
  }

  return (
    <form className="form" onSubmit={sendOtp}>
      <label className="field">
        <span>Full name</span>
        <input
          placeholder="Juan Dela Cruz"
          value={name}
          onChange={(e) => { setName(e.target.value); setError('') }}
        />
      </label>
      <div className="field">
        <span>Rank</span>
        <Dropdown value={rank} options={ranks} onChange={setRank} ariaLabel="Rank" />
      </div>
      <PhoneField value={phone} onChange={(v) => { setPhone(v); setError('') }} />
      <label className="field">
        <span>Create 4-digit PIN</span>
        <input
          type="password"
          inputMode="numeric"
          maxLength={4}
          placeholder="••••"
          value={pin}
          onChange={(e) => { setPin(e.target.value.replace(/\D/g, '').slice(0, 4)); setError('') }}
        />
      </label>
      <label className="field">
        <span>Confirm PIN</span>
        <input
          type="password"
          inputMode="numeric"
          maxLength={4}
          placeholder="••••"
          value={confirm}
          onChange={(e) => { setConfirm(e.target.value.replace(/\D/g, '').slice(0, 4)); setError('') }}
        />
      </label>
      {error && <div className="auth-error">{error}</div>}
      <button type="submit" className="btn primary big" disabled={!valid || busy}>
        {busy ? 'Sending OTP…' : 'Send OTP'}
      </button>
    </form>
  )
}
