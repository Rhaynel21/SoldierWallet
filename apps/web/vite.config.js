import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// Sends the JSON response
function sendJson(res, status, obj) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(obj))
}

function readBody(req) {
  return new Promise((resolve) => {
    let body = ''
    req.on('data', (c) => (body += c))
    req.on('end', () => {
      try {
        resolve(JSON.parse(body || '{}'))
      } catch {
        resolve({})
      }
    })
  })
}

// Vite plugin: OTP endpoints served by the dev server itself (no separate backend)
function otpPlugin(env) {
  const API_KEY = env.SEMAPHORE_API_KEY
  const SENDER = env.SEMAPHORE_SENDER || ''
  const store = new Map() // phone -> { code, expires, attempts }
  const digits = (s) => String(s || '').replace(/\D/g, '')

  return {
    name: 'saludo-otp',
    configureServer(server) {
      server.middlewares.use('/api/otp/send', async (req, res, next) => {
        if (req.method !== 'POST') return next()
        const { phone } = await readBody(req)
        const num = digits(phone)
        if (num.length < 10) return sendJson(res, 400, { ok: false, error: 'Invalid phone number.' })
        if (!API_KEY) return sendJson(res, 500, { ok: false, error: 'SEMAPHORE_API_KEY not set in .env' })
        try {
          const params = new URLSearchParams({
            apikey: API_KEY,
            number: num,
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
          if (!code || code === 'undefined')
            return sendJson(res, 502, { ok: false, error: 'SMS provider error.', detail: data })
          store.set(num, { code, expires: Date.now() + 5 * 60 * 1000, attempts: 0 })
          sendJson(res, 200, { ok: true, message: 'OTP sent.' })
        } catch (e) {
          sendJson(res, 500, { ok: false, error: String(e) })
        }
      })

      server.middlewares.use('/api/otp/verify', async (req, res, next) => {
        if (req.method !== 'POST') return next()
        const { phone, code } = await readBody(req)
        const num = digits(phone)
        const entry = store.get(num)
        if (!entry) return sendJson(res, 200, { ok: false, error: 'No OTP requested for this number.' })
        if (Date.now() > entry.expires) {
          store.delete(num)
          return sendJson(res, 200, { ok: false, error: 'OTP expired. Request a new one.' })
        }
        if (entry.attempts >= 5) {
          store.delete(num)
          return sendJson(res, 200, { ok: false, error: 'Too many attempts. Request a new OTP.' })
        }
        if (String(entry.code) !== String(code || '').trim()) {
          entry.attempts += 1
          return sendJson(res, 200, { ok: false, error: 'Incorrect code.' })
        }
        store.delete(num)
        sendJson(res, 200, { ok: true })
      })

      server.middlewares.use('/api/health', (_req, res) => {
        sendJson(res, 200, { ok: true, semaphore: Boolean(API_KEY) })
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react(), otpPlugin(env)],
    server: {
      port: 5173,
      open: true,
    },
  }
})
