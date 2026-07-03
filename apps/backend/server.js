import express from 'express'
import cors from 'cors'
import 'dotenv/config'

const app = express()
app.use(cors())
app.use(express.json())

const API_KEY = process.env.SEMAPHORE_API_KEY
const SENDER = process.env.SEMAPHORE_SENDER || '' // optional approved sender name
const OTP_TTL_MS = 5 * 60 * 1000

// phone (digits) -> { code, expires, attempts }
const otpStore = new Map()

const digits = (s) => String(s || '').replace(/\D/g, '')

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, semaphore: Boolean(API_KEY) })
})

// Send an OTP via Semaphore
app.post('/api/otp/send', async (req, res) => {
  const phone = digits(req.body.phone)
  if (phone.length < 10) return res.status(400).json({ ok: false, error: 'Invalid phone number.' })
  if (!API_KEY) return res.status(500).json({ ok: false, error: 'SEMAPHORE_API_KEY not set on server.' })

  try {
    const params = new URLSearchParams({
      apikey: API_KEY,
      number: phone,
      message: 'Your SALUDO verification code is: {otp}. Valid for 5 minutes. Do not share this code.',
    })
    if (SENDER) params.set('sendername', SENDER)

    const r = await fetch('https://api.semaphore.co/api/v4/otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params,
    })
    const data = await r.json()
    const code = Array.isArray(data) ? String(data[0]?.code ?? '') : String(data?.code ?? '')

    if (!code || code === 'undefined') {
      return res.status(502).json({ ok: false, error: 'SMS provider error.', detail: data })
    }

    otpStore.set(phone, { code, expires: Date.now() + OTP_TTL_MS, attempts: 0 })
    res.json({ ok: true, message: 'OTP sent.' })
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) })
  }
})

// Verify an OTP
app.post('/api/otp/verify', (req, res) => {
  const phone = digits(req.body.phone)
  const code = String(req.body.code || '').trim()
  const entry = otpStore.get(phone)

  if (!entry) return res.json({ ok: false, error: 'No OTP requested for this number.' })
  if (Date.now() > entry.expires) {
    otpStore.delete(phone)
    return res.json({ ok: false, error: 'OTP expired. Request a new one.' })
  }
  if (entry.attempts >= 5) {
    otpStore.delete(phone)
    return res.json({ ok: false, error: 'Too many attempts. Request a new OTP.' })
  }
  if (entry.code !== code) {
    entry.attempts += 1
    return res.json({ ok: false, error: 'Incorrect code.' })
  }
  otpStore.delete(phone)
  res.json({ ok: true })
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`SALUDO backend running on http://localhost:${PORT}`))
