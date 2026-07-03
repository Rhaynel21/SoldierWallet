import { useState } from 'react'
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'

import { useWallet } from '../store/WalletContext.js'
import { API_BASE, otpEnabled } from '../config.js'
import Logo from '../components/Logo.js'
import Dropdown from '../components/Dropdown.js'
import { Button, Field, Input, PhFlag } from '../components/ui.js'
import { colors, radius, shadow } from '../theme.js'

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

function toLocalPhone(v) {
  const d = String(v).replace(/\D/g, '')
  if (d.startsWith('63')) return '0' + d.slice(2)
  if (d.startsWith('0')) return d
  if (d.length === 10 && d.startsWith('9')) return '0' + d
  return d
}

export default function AuthScreen() {
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
    <View style={styles.mpin}>
      <SafeAreaView edges={['top']} style={styles.mpinTop}>
        <View style={styles.mpinBrand}>
          <Logo size={46} white />
          <Text style={styles.mpinBrandText}>SALUDO</Text>
        </View>
        <Text style={styles.mpinHello}>Welcome back!</Text>

        {changing ? (
          <View style={[styles.mpinPhone, styles.mpinPhoneEditing]}>
            <TextInput
              style={styles.mpinPhoneInput}
              keyboardType="phone-pad"
              autoFocus
              value={phone}
              onChangeText={setPhone}
              placeholder="09XX XXX XXXX"
              placeholderTextColor="rgba(255,255,255,0.6)"
            />
            <Pressable style={styles.mpinOk} onPress={() => setChanging(false)}>
              <Text style={styles.mpinOkText}>OK</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.mpinPhone}>
            <Text style={styles.mpinPhoneText}>{phone || 'Set number'}</Text>
            <Pressable style={styles.mpinSwitch} onPress={() => setChanging(true)}>
              <Ionicons name="swap-horizontal" size={18} color="#fff" />
            </Pressable>
          </View>
        )}

        <Text style={styles.mpinEnter}>Enter your MPIN</Text>
        <View style={styles.mpinDots}>
          {[0, 1, 2, 3].map((i) => (
            <View key={i} style={[styles.mpinDot, i < pin.length && styles.mpinDotOn]} />
          ))}
        </View>
        {error ? <Text style={styles.mpinErr}>{error}</Text> : null}

        <View style={{ flex: 1 }} />
        <Text style={styles.mpinWarn}>
          Never share your MPIN or OTP with anyone.
        </Text>
      </SafeAreaView>

      <SafeAreaView edges={['bottom']} style={styles.mpinPad}>
        <View style={styles.mpinKeys}>
          {keys.map((k, i) =>
            k === '' ? (
              <View key={i} style={styles.mpinKey} />
            ) : k === 'back' ? (
              <Pressable key={i} style={styles.mpinKey} onPress={() => setPin((p) => p.slice(0, -1))}>
                <Ionicons name="backspace-outline" size={28} color={colors.inkSoft} />
              </Pressable>
            ) : (
              <Pressable key={i} style={styles.mpinKey} onPress={() => press(k)}>
                <Text style={styles.mpinKeyText}>{k}</Text>
              </Pressable>
            ),
          )}
        </View>
        <View style={styles.mpinLinks}>
          <Pressable onPress={onSignup}>
            <Text style={styles.mpinLink}>Sign up</Text>
          </Pressable>
          <Pressable>
            <Text style={styles.mpinLink}>Forgot MPIN?</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  )
}

/* ---------- Sign up ---------- */
function SignupScreen({ signup, onBack }) {
  return (
    <SafeAreaView style={styles.authRoot} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.authScroll} keyboardShouldPersistTaps="handled">
          <View style={styles.authBrand}>
            <View style={styles.authLogo}>
              <Logo size={72} />
            </View>
            <Text style={styles.authTitle}>Create account</Text>
            <Text style={styles.authTagline}>Mag-sign up gamit ang iyong phone number</Text>
          </View>

          <View style={styles.authCard}>
            <SignupForm signup={signup} />
          </View>

          <Pressable style={styles.authSwitch} onPress={onBack}>
            <Text style={styles.authSwitchText}>
              May account na? <Text style={{ fontWeight: '800' }}>Log in</Text>
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
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

  function createAccount() {
    const res = signup({ name, rank, phone: localPhone, pin })
    if (!res.ok) setError(res.error)
  }

  async function sendOtp() {
    if (!phoneOk) return setError('Maling phone number.')
    if (pin !== confirm) return setError('Hindi magkatugma ang PIN.')
    setError('')
    if (!otpEnabled) {
      // No OTP backend configured — create the account directly.
      createAccount()
      return
    }
    setBusy(true)
    try {
      const r = await fetch(`${API_BASE}/api/otp/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: localPhone }),
      })
      const data = await r.json()
      if (data.ok) setStep('otp')
      else setError(data.error || 'Hindi ma-send ang OTP.')
    } catch {
      setError('Hindi maabot ang OTP server. Tiyaking tumatakbo ang backend.')
    } finally {
      setBusy(false)
    }
  }

  async function verifyOtp() {
    setBusy(true)
    setError('')
    try {
      const r = await fetch(`${API_BASE}/api/otp/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: localPhone, code: otp }),
      })
      const data = await r.json()
      if (!data.ok) {
        setError(data.error || 'Maling code.')
        return
      }
      createAccount()
    } catch {
      setError('Hindi maabot ang OTP server.')
    } finally {
      setBusy(false)
    }
  }

  if (step === 'otp') {
    return (
      <View style={{ gap: 15 }}>
        <Text style={styles.otpLead}>
          Nagpadala kami ng verification code sa {phone} via SMS.
        </Text>
        <Field label="Enter OTP">
          <TextInput
            style={styles.otpInput}
            keyboardType="number-pad"
            maxLength={6}
            placeholder="______"
            placeholderTextColor={colors.inkFaint}
            value={otp}
            onChangeText={(t) => {
              setOtp(t.replace(/\D/g, ''))
              setError('')
            }}
            autoFocus
          />
        </Field>
        {error ? <ErrorBox text={error} /> : null}
        <Button title={busy ? 'Verifying…' : 'Verify & Create account'} big onPress={verifyOtp} disabled={busy || otp.length < 4} />
        <Button title="Resend code" variant="ghost" onPress={sendOtp} disabled={busy} />
        <Pressable onPress={() => { setStep('form'); setOtp(''); setError('') }}>
          <Text style={styles.linkBtn}>‹ Baguhin ang details</Text>
        </Pressable>
      </View>
    )
  }

  return (
    <View style={{ gap: 15 }}>
      <Field label="Full name">
        <Input placeholder="Juan Dela Cruz" value={name} onChangeText={(t) => { setName(t); setError('') }} />
      </Field>
      <Field label="Rank">
        <Dropdown value={rank} options={ranks} onChange={setRank} label="Rank" />
      </Field>
      <Field label="Phone number">
        <View style={styles.phoneRow}>
          <View style={styles.flagSelect}>
            <PhFlag />
            <Text style={styles.flagCaret}>+63</Text>
          </View>
          <TextInput
            style={styles.phoneInput}
            keyboardType="phone-pad"
            placeholder="9XX XXX XXXX"
            placeholderTextColor={colors.inkFaint}
            value={phone}
            onChangeText={(t) => { setPhone(t); setError('') }}
          />
        </View>
      </Field>
      <Field label="Create 4-digit PIN">
        <Input
          secureTextEntry
          keyboardType="number-pad"
          maxLength={4}
          placeholder="••••"
          value={pin}
          onChangeText={(t) => { setPin(t.replace(/\D/g, '').slice(0, 4)); setError('') }}
        />
      </Field>
      <Field label="Confirm PIN">
        <Input
          secureTextEntry
          keyboardType="number-pad"
          maxLength={4}
          placeholder="••••"
          value={confirm}
          onChangeText={(t) => { setConfirm(t.replace(/\D/g, '').slice(0, 4)); setError('') }}
        />
      </Field>
      {error ? <ErrorBox text={error} /> : null}
      <Button
        title={busy ? 'Sending OTP…' : otpEnabled ? 'Send OTP' : 'Create account'}
        big
        onPress={sendOtp}
        disabled={!valid || busy}
      />
    </View>
  )
}

function ErrorBox({ text }) {
  return (
    <View style={styles.errBox}>
      <Text style={styles.errText}>{text}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  mpin: { flex: 1, backgroundColor: colors.blueRoyal },
  mpinTop: {
    flex: 1,
    backgroundColor: colors.blueRoyal,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 22,
    alignItems: 'center',
  },
  mpinBrand: { flexDirection: 'row', alignItems: 'center', gap: 11, marginBottom: 26, marginTop: 20 },
  mpinBrandText: { color: '#fff', fontSize: 30, fontWeight: '800', letterSpacing: 1 },
  mpinHello: { color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 16 },
  mpinPhone: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    width: 300,
    maxWidth: '82%',
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderRadius: 30,
    paddingVertical: 15,
    paddingHorizontal: 22,
  },
  mpinPhoneEditing: {},
  mpinPhoneText: { color: '#fff', fontSize: 22, fontWeight: '800', letterSpacing: 1 },
  mpinPhoneInput: { flex: 1, color: '#fff', fontSize: 20, fontWeight: '800', textAlign: 'center' },
  mpinSwitch: { position: 'absolute', right: 18 },
  mpinOk: { backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 16, paddingVertical: 6, paddingHorizontal: 14 },
  mpinOkText: { color: colors.blueRoyal, fontWeight: '800' },
  mpinEnter: { color: '#fff', marginTop: 28, fontSize: 18, fontWeight: '700' },
  mpinDots: { flexDirection: 'row', gap: 22, marginTop: 22 },
  mpinDot: { width: 16, height: 16, borderRadius: 8, borderWidth: 2, borderColor: 'rgba(255,255,255,0.6)' },
  mpinDotOn: { backgroundColor: '#fff', borderColor: '#fff' },
  mpinErr: { marginTop: 16, color: '#ffd7dc', fontWeight: '600', fontSize: 13, textAlign: 'center' },
  mpinWarn: { color: 'rgba(255,255,255,0.7)', fontSize: 12.5, textAlign: 'center', lineHeight: 20, paddingTop: 22 },
  mpinPad: { backgroundColor: colors.bg, paddingHorizontal: 22, paddingTop: 16, paddingBottom: 8 },
  mpinKeys: { flexDirection: 'row', flexWrap: 'wrap' },
  mpinKey: { width: '33.33%', alignItems: 'center', justifyContent: 'center', paddingVertical: 16 },
  mpinKeyText: { fontSize: 30, fontWeight: '700', color: colors.blue },
  mpinLinks: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 6, paddingTop: 12 },
  mpinLink: { color: colors.blueRoyal, fontWeight: '800', fontSize: 15 },

  authRoot: { flex: 1, backgroundColor: colors.bg },
  authScroll: { padding: 22, paddingTop: 20, width: '100%', maxWidth: 520, alignSelf: 'center' },
  authBrand: { alignItems: 'center', marginBottom: 26 },
  authLogo: { marginBottom: 12 },
  authTitle: { fontSize: 26, fontWeight: '800', color: colors.ink },
  authTagline: { fontSize: 13, color: colors.inkSoft, marginTop: 6 },
  authCard: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.lg,
    padding: 18,
    ...shadow.md,
  },
  authSwitch: { alignItems: 'center', marginTop: 18 },
  authSwitchText: { color: colors.blueRoyal, fontWeight: '600', fontSize: 14 },

  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: colors.field,
    borderRadius: 14,
    paddingHorizontal: 12,
  },
  flagSelect: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingRight: 10,
    borderRightWidth: 1,
    borderRightColor: colors.line,
    paddingVertical: 12,
  },
  flagCaret: { fontSize: 13, color: colors.inkSoft, fontWeight: '600' },
  phoneInput: { flex: 1, fontSize: 15, color: colors.ink, paddingVertical: 12 },

  otpLead: { fontSize: 13.5, color: colors.inkSoft, lineHeight: 20 },
  otpInput: {
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: colors.field,
    borderRadius: radius.sm,
    paddingVertical: 14,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 8,
    color: colors.ink,
  },
  linkBtn: { color: colors.blueRoyal, fontWeight: '700', fontSize: 14, textAlign: 'center', padding: 6 },
  errBox: { backgroundColor: '#fdeaec', borderWidth: 1, borderColor: '#f4c4c9', borderRadius: 12, padding: 12 },
  errText: { color: colors.red, fontSize: 13, fontWeight: '600' },
})
