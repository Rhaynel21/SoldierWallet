import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWallet } from '../store/WalletContext.jsx'
import { peso } from '../utils/format.js'

const ewallets = ['GCash', 'Maya', 'GrabPay', 'ShopeePay', 'Coins.ph']
const banks = ['BDO', 'BPI', 'Landbank', 'Metrobank', 'UnionBank', 'PNB']

export default function Send() {
  const { cash, sendMoney } = useWallet()
  const navigate = useNavigate()

  const [channel, setChannel] = useState('ewallet')
  const [provider, setProvider] = useState(ewallets[0])
  const [account, setAccount] = useState('')
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [done, setDone] = useState(null)

  const providers = channel === 'ewallet' ? ewallets : banks
  const amt = Number(amount)
  const insufficient = amt > cash
  const valid = amt > 0 && !insufficient && account.trim().length >= 4

  function switchChannel(next) {
    setChannel(next)
    setProvider(next === 'ewallet' ? ewallets[0] : banks[0])
  }

  function submit(e) {
    e.preventDefault()
    if (!valid) return
    sendMoney({ channel, provider, account, name, amount: amt, note })
    setDone({ provider, account, name, amount: amt, channel })
  }

  if (done) {
    return (
      <div className="page center-page">
        <div className="success">
          <div className="success-check">✓</div>
          <h2>Transfer Successful</h2>
          <p className="success-amt">{peso(done.amount)}</p>
          <p className="success-sub">
            Sent to {done.name || done.account} · {done.provider}
          </p>
          <div className="success-actions">
            <button className="btn primary" onClick={() => navigate('/')}>
              Back to Home
            </button>
            <button
              className="btn ghost"
              onClick={() => {
                setDone(null)
                setAccount('')
                setName('')
                setAmount('')
                setNote('')
              }}
            >
              New Transfer
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="page-top">
        <button className="back" onClick={() => navigate('/')}>‹</button>
        <h2>Send Money</h2>
      </div>

      <div className="balance-pill">Available: {peso(cash)}</div>

      <div className="segmented">
        <button
          className={channel === 'ewallet' ? 'seg active' : 'seg'}
          onClick={() => switchChannel('ewallet')}
        >
          E-Wallet
        </button>
        <button
          className={channel === 'bank' ? 'seg active' : 'seg'}
          onClick={() => switchChannel('bank')}
        >
          Bank Transfer
        </button>
      </div>

      <form className="form" onSubmit={submit}>
        <label className="field">
          <span>{channel === 'ewallet' ? 'E-Wallet Provider' : 'Bank'}</span>
          <select value={provider} onChange={(e) => setProvider(e.target.value)}>
            {providers.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>{channel === 'ewallet' ? 'Mobile Number / Account' : 'Account Number'}</span>
          <input
            inputMode="numeric"
            placeholder={channel === 'ewallet' ? '09XX XXX XXXX' : '0000 0000 0000'}
            value={account}
            onChange={(e) => setAccount(e.target.value)}
          />
        </label>

        <label className="field">
          <span>Recipient Name</span>
          <input
            placeholder="Juan Dela Cruz"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
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
          <input
            placeholder="For groceries…"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </label>

        <button type="submit" className="btn primary big" disabled={!valid}>
          Send {amt > 0 ? peso(amt) : 'Money'}
        </button>
      </form>
    </div>
  )
}
