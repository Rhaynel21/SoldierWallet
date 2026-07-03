import { useEffect, useState } from 'react'
import {
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { CameraView, useCameraPermissions } from 'expo-camera'
import QRCode from 'react-native-qrcode-svg'
import { Ionicons } from '@expo/vector-icons'

import { useWallet } from '../store/WalletContext.js'
import { peso } from '../utils/format.js'
import { AmountInput, Button, PageHeader } from '../components/ui.js'
import { colors, radius, shadow } from '../theme.js'

export default function QRScreen({ navigation, route }) {
  const [mode, setMode] = useState(route.params?.mode || 'scan')

  // React to navigation params (e.g. "Generate QR" from Send opens receive).
  useEffect(() => {
    if (route.params?.mode) setMode(route.params.mode)
  }, [route.params?.mode])

  if (mode === 'menu')
    return <Menu onPick={setMode} onHome={() => setMode('scan')} navigation={navigation} />
  if (mode === 'receive') return <Receive onBack={() => setMode('menu')} />
  if (mode === 'pay') return <PayCode onBack={() => setMode('menu')} onScan={() => setMode('scan')} />
  if (mode === 'commute') return <Commute onBack={() => setMode('menu')} navigation={navigation} />

  return <Scanner onBack={() => navigation.navigate('Home')} onGenerate={() => setMode('menu')} />
}

/* ---------- Menu ---------- */
function Menu({ onPick, onHome, navigation }) {
  const items = [
    { key: 'pay', tint: colors.blueTint2, fg: colors.blueRoyal, title: 'Pay using QR Code', desc: 'Show your code to the cashier to pay for your purchases.' },
    { key: 'receive', tint: '#eef1ff', fg: '#90a4ec', title: 'Receive money via QR Code', desc: 'Share this code so anyone can send you money via e-wallet or bank.' },
    { key: 'benefits', tint: '#fdecee', fg: colors.red, title: 'Benefits QR', desc: 'Pay hospitals & accredited partners using your benefits.' },
  ]
  return (
    <SafeAreaView style={styles.lightRoot} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <PageHeader title="My QR Code" onBack={onHome} />
        <Text style={styles.menuHeading}>Generate a QR Code to pay for a purchase or request money.</Text>
        <View style={styles.menuCard}>
          {items.map((it, i) => (
            <Pressable
              key={it.key}
              style={[styles.menuRow, i === items.length - 1 && { borderBottomWidth: 0 }]}
              onPress={() => (it.key === 'benefits' ? navigation.navigate('Benefits') : onPick(it.key))}
            >
              <View style={[styles.qrg, { backgroundColor: it.tint }]}>
                <Ionicons name="qr-code" size={28} color={it.fg} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.menuTitle}>{it.title}</Text>
                <Text style={styles.menuDesc}>{it.desc}</Text>
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

/* ---------- Receive (My QR) ---------- */
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

  return (
    <SafeAreaView style={styles.blueRoot} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <QrTopbar title="My QR" onBack={onBack} />
        <View style={styles.myqrCard}>
          <View style={styles.qrBadgeWrap}>
            <QRCode value={payload} size={210} color="#0a1a4f" backgroundColor="#fff" />
          </View>
          <Text style={styles.myqrFee}>Transfer fees may apply.</Text>
          <Text style={styles.myqrName}>{user.name}</Text>
          <Text style={styles.myqrField}>
            Mobile No.: <Text style={{ color: colors.ink, fontWeight: '700' }}>{user.mobile}</Text>
          </Text>
          <Text style={styles.myqrField}>
            User ID: <Text style={{ color: colors.ink, fontWeight: '700' }}>••••••{String(user.serialNo).slice(-6)}</Text>
          </Text>

          <View style={styles.dashed} />

          <Text style={styles.myqrSpecify}>Specify an amount upon scanning your QR code.</Text>
          {editing && (
            <View style={{ marginBottom: 12 }}>
              <AmountInput value={amount} onChangeText={setAmount} autoFocus />
            </View>
          )}
          <Pressable
            style={[styles.addAmount, editing && styles.addAmountFilled]}
            onPress={() => setEditing((e) => !e)}
          >
            <Text style={[styles.addAmountText, editing && { color: '#fff' }]}>
              {editing ? (amt > 0 ? `Set ${peso(amt)}` : 'Done') : 'Add amount'}
            </Text>
          </Pressable>
        </View>

        <View style={styles.myqrActions}>
          <Pressable style={styles.myqrAction} onPress={() => receiveMoney({ amount: amt > 0 ? amt : 100, from: 'Juan (demo)' })}>
            <Ionicons name="arrow-down-circle-outline" size={18} color="#fff" />
            <Text style={styles.myqrActionText}>Simulate receive</Text>
          </Pressable>
          <Pressable style={styles.myqrAction} onPress={() => Share.share({ message: 'My SALUDO QR' })}>
            <Ionicons name="share-outline" size={18} color="#fff" />
            <Text style={styles.myqrActionText}>Share QR</Text>
          </Pressable>
        </View>
        <Text style={styles.footNote}>Cash Wallet balance: {peso(cash)}</Text>
      </ScrollView>
    </SafeAreaView>
  )
}

/* ---------- Pay code ---------- */
function PayCode({ onBack, onScan }) {
  const { user, cash, benefits, payMerchant } = useWallet()
  const [wallet, setWallet] = useState('cash')
  const [charge, setCharge] = useState('')
  const [charging, setCharging] = useState(false)
  const balance = wallet === 'cash' ? cash : benefits

  const payload = JSON.stringify({ t: 'SOLDIER_PAY', sn: user.serialNo, wallet })
  const val = Number(charge)

  return (
    <SafeAreaView style={styles.blueRoot} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <QrTopbar title="Pay QR / Barcode" onBack={onBack} />
        <View style={styles.paycard}>
          <View style={styles.paycardHead}>
            <View>
              <Text style={styles.payWithLabel}>Pay with</Text>
              <Text style={styles.payWithWallet}>{wallet === 'cash' ? 'Cash Wallet' : 'Benefits'}</Text>
            </View>
            <Pressable style={styles.changeBtn} onPress={() => setWallet((w) => (w === 'cash' ? 'benefits' : 'cash'))}>
              <Text style={styles.changeBtnText}>Change</Text>
            </Pressable>
          </View>
          <View style={styles.paycardBody}>
            <Barcode />
            <Text style={styles.barcodeNum}>••••••{String(user.serialNo).slice(-4)} · View Numbers</Text>
            <QRCode value={payload} size={188} color="#0a1a4f" backgroundColor="#fff" />
          </View>
          <Pressable style={styles.paycardFoot} onPress={() => setCharging((c) => !c)}>
            <Text style={styles.paycardFootText}>
              Your payment will be charged automatically. <Text style={{ fontWeight: '800' }}>(tap to simulate)</Text>
            </Text>
          </Pressable>
        </View>

        {charging && (
          <View style={styles.chargeBox}>
            <AmountInput value={charge} onChangeText={setCharge} autoFocus placeholder="Cashier amount" />
            <View style={{ height: 10 }} />
            <Button
              title={`Charge ${val > 0 ? peso(val) : ''}`}
              disabled={!(val > 0 && val <= balance)}
              onPress={() => {
                payMerchant({ amount: val, merchant: 'Participating store' })
                setCharge('')
                setCharging(false)
              }}
            />
          </View>
        )}

        <Text style={styles.paycardCaption}>Show this to the cashier of any participating store in the Philippines.</Text>
        <Text style={styles.footNote}>Balance: {peso(balance)}</Text>

        <Pressable style={styles.scanLink} onPress={onScan}>
          <Ionicons name="qr-code-outline" size={20} color="#fff" />
          <Text style={styles.scanLinkText}>Scan QR code</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  )
}

function Barcode() {
  // Fake barcode: alternating solid bars (no gradient).
  const widths = [2, 1, 3, 1, 2, 1, 1, 3, 2, 1, 2, 1, 3, 1, 1, 2, 1, 3, 2, 1, 1, 2, 3, 1, 2, 1, 1, 2]
  return (
    <View style={styles.barcode}>
      {widths.map((w, i) => (
        <View key={i} style={{ width: w * 2, backgroundColor: i % 2 === 0 ? '#0a1a4f' : '#fff' }} />
      ))}
    </View>
  )
}

/* ---------- Scanner ---------- */
function Scanner({ onBack, onGenerate }) {
  const { cash, payMerchant } = useWallet()
  const [permission, requestPermission] = useCameraPermissions()
  const [result, setResult] = useState(null)
  const [amount, setAmount] = useState('')
  const [paid, setPaid] = useState(null) // { amount, payee } once auto-charged

  function handleScan({ data }) {
    if (result || paid) return
    let parsed = null
    try {
      parsed = JSON.parse(data)
    } catch {
      parsed = null
    }
    // As soon as a QR carrying an amount is scanned, charge it (deduct) automatically.
    const a = Number(parsed?.amount || 0)
    if (a > 0 && a <= cash) {
      const p = parsed?.name || parsed?.merchant || 'Merchant'
      payMerchant({ amount: a, merchant: p })
      setPaid({ amount: a, payee: p })
      return
    }
    setResult({ raw: data, parsed })
  }

  const payee =
    result?.parsed?.name ||
    result?.parsed?.merchant ||
    (result ? `Merchant (${String(result.raw).slice(0, 16)}…)` : '')
  const prefill = result?.parsed?.amount
  const amt = Number(amount || prefill || 0)
  const valid = amt > 0 && amt <= cash

  return (
    <View style={styles.scannerRoot}>
      {permission?.granted && !result && (
        <CameraView
          style={StyleSheet.absoluteFill}
          facing="back"
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          onBarcodeScanned={handleScan}
        />
      )}
      <View style={styles.scannerOverlay} />

      <SafeAreaView style={styles.scannerContent} edges={['top', 'bottom']}>
        <QrTopbar title="QR Reader" onBack={onBack} dark />

        <View style={styles.scanWindow}>
          <View style={[styles.corner, styles.tl]} />
          <View style={[styles.corner, styles.tr]} />
          <View style={[styles.corner, styles.bl]} />
          <View style={[styles.corner, styles.br]} />
          <Text style={styles.scanHint}>
            {permission?.granted ? 'Point camera at a QR code' : 'Camera permission needed'}
          </Text>
        </View>

        {!permission?.granted && (
          <View style={{ alignItems: 'center', gap: 12, marginTop: 20 }}>
            <Text style={styles.permText}>Payagan ang camera para mag-scan ng QR.</Text>
            <Button title="Grant camera access" onPress={requestPermission} />
          </View>
        )}

        <View style={{ flex: 1 }} />

        <View style={styles.scannerActions}>
          <Pressable style={styles.scannerAct} onPress={onGenerate}>
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={styles.scannerActText}>Generate QR</Text>
          </Pressable>
        </View>

        {paid && (
          <View style={styles.scanResult}>
            <Text style={styles.scanBadge}>✓ Payment successful</Text>
            <Text style={styles.scanPayee}>{paid.payee}</Text>
            <Text style={styles.scanPaidAmt}>− {peso(paid.amount)}</Text>
            <Button title="Done" big onPress={onBack} />
          </View>
        )}

        {result && !paid && (
          <View style={styles.scanResult}>
            <Text style={styles.scanBadge}>✓ QR detected</Text>
            <Text style={styles.scanPayee}>{payee}</Text>
            <AmountInput
              value={amount || (prefill ? String(prefill) : '')}
              onChangeText={setAmount}
              autoFocus
            />
            <View style={{ height: 12 }} />
            <Button
              title={`Pay ${amt > 0 ? peso(amt) : ''}`}
              big
              disabled={!valid}
              onPress={() => {
                payMerchant({ amount: amt, merchant: payee })
                onBack()
              }}
            />
            <Pressable onPress={() => { setResult(null); setAmount('') }} style={{ marginTop: 10 }}>
              <Text style={styles.scanAgain}>Scan again</Text>
            </Pressable>
          </View>
        )}
      </SafeAreaView>
    </View>
  )
}

/* ---------- Commute ---------- */
const fares = [
  { mode: 'Jeepney', fare: 13, icon: 'car' },
  { mode: 'Bus', fare: 15, icon: 'bus' },
  { mode: 'MRT / LRT', fare: 25, icon: 'train' },
  { mode: 'Tricycle', fare: 20, icon: 'bicycle' },
  { mode: 'Grab / Taxi', fare: 180, icon: 'car-sport' },
  { mode: 'UV Express', fare: 50, icon: 'car-outline' },
]

function Commute({ onBack, navigation }) {
  const { cash, payCommute } = useWallet()
  const [done, setDone] = useState(null)

  if (done) {
    return (
      <SafeAreaView style={[styles.lightRoot, { alignItems: 'center', justifyContent: 'center', padding: 22 }]} edges={['top']}>
        <View style={styles.successCheck}>
          <Ionicons name="checkmark" size={46} color="#fff" />
        </View>
        <Text style={styles.successTitle}>Fare Paid</Text>
        <Text style={styles.successAmt}>{peso(done.fare)}</Text>
        <Text style={{ color: colors.inkSoft }}>{done.mode} • Tap-and-go</Text>
        <View style={{ width: '100%', gap: 10, marginTop: 22 }}>
          <Button title="Back to Home" onPress={() => navigation.navigate('Home')} />
          <Button title="Ride Again" variant="ghost" onPress={() => setDone(null)} />
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.lightRoot} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <PageHeader title="Commute" onBack={onBack} />
        <View style={styles.pillWrap}><Text style={styles.pill}>Available: {peso(cash)}</Text></View>
        <Text style={styles.commuteHint}>Tap your QR to pay transport fare</Text>
        <View style={styles.fareGrid}>
          {fares.map((f) => {
            const disabled = f.fare > cash
            return (
              <Pressable
                key={f.mode}
                style={[styles.fare, disabled && { opacity: 0.4 }]}
                onPress={() => {
                  if (disabled) return
                  payCommute({ amount: f.fare, mode: f.mode })
                  setDone(f)
                }}
              >
                <Ionicons name={f.icon} size={28} color={colors.blueRoyal} />
                <Text style={styles.fareMode}>{f.mode}</Text>
                <Text style={styles.fareAmt}>{peso(f.fare)}</Text>
              </Pressable>
            )
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

/* ---------- Shared topbar for blue/dark QR screens ---------- */
function QrTopbar({ title, onBack, dark }) {
  return (
    <View style={styles.qrTopbar}>
      <Pressable onPress={onBack} style={{ width: 34 }}>
        <Ionicons name="chevron-back" size={28} color="#fff" />
      </Pressable>
      <Text style={styles.qrTopbarTitle}>{title}</Text>
      <View style={{ width: 34 }} />
    </View>
  )
}

const styles = StyleSheet.create({
  lightRoot: { flex: 1, backgroundColor: colors.bg },
  blueRoot: { flex: 1, backgroundColor: colors.blueRoyal },
  content: { padding: 18, paddingBottom: 40, width: '100%', maxWidth: 520, alignSelf: 'center' },

  qrTopbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 },
  qrTopbarTitle: { color: '#fff', fontWeight: '700', fontSize: 17 },

  menuHeading: { fontSize: 22, fontWeight: '800', lineHeight: 28, marginHorizontal: 2, marginBottom: 18, color: colors.ink },
  menuCard: { backgroundColor: '#fff', borderWidth: 1, borderColor: colors.line, borderRadius: 20, overflow: 'hidden', ...shadow.md },
  menuRow: { flexDirection: 'row', alignItems: 'center', gap: 15, padding: 16, borderBottomWidth: 1, borderBottomColor: colors.line },
  qrg: { width: 54, height: 54, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  menuTitle: { fontWeight: '800', fontSize: 16, color: colors.ink },
  menuDesc: { fontSize: 12.5, color: colors.inkSoft, lineHeight: 17, marginTop: 3 },

  myqrCard: { backgroundColor: '#fff', borderRadius: 24, padding: 24, alignItems: 'center', ...shadow.md },
  qrBadgeWrap: { padding: 4 },
  myqrFee: { fontSize: 12, color: colors.inkSoft, marginTop: 12, marginBottom: 16 },
  myqrName: { fontSize: 22, fontWeight: '800', color: colors.blueRoyal },
  myqrField: { fontSize: 14, color: colors.inkSoft, marginTop: 10 },
  dashed: { borderTopWidth: 2, borderStyle: 'dashed', borderColor: '#d7dbe9', alignSelf: 'stretch', marginVertical: 22 },
  myqrSpecify: { fontSize: 14, fontWeight: '600', marginBottom: 14, color: colors.ink, textAlign: 'center' },
  addAmount: { alignSelf: 'stretch', paddingVertical: 14, borderRadius: 30, borderWidth: 2, borderColor: colors.blueRoyal, alignItems: 'center' },
  addAmountFilled: { backgroundColor: colors.blueRoyal },
  addAmountText: { color: colors.blueRoyal, fontWeight: '800', fontSize: 16 },
  myqrActions: { flexDirection: 'row', justifyContent: 'center', gap: 46, marginTop: 26 },
  myqrAction: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  myqrActionText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  footNote: { textAlign: 'center', color: 'rgba(255,255,255,0.85)', fontSize: 12, marginTop: 16 },

  paycard: { backgroundColor: '#fff', borderRadius: 24, overflow: 'hidden', ...shadow.md },
  paycardHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#f3f6ff' },
  payWithLabel: { fontSize: 12, color: colors.inkSoft },
  payWithWallet: { fontSize: 17, fontWeight: '800', color: colors.ink },
  changeBtn: { backgroundColor: '#dfe6ff', borderRadius: 22, paddingVertical: 9, paddingHorizontal: 18 },
  changeBtnText: { color: colors.blueRoyal, fontWeight: '800', fontSize: 15 },
  paycardBody: { padding: 24, alignItems: 'center', gap: 14 },
  barcode: { width: '74%', height: 58, flexDirection: 'row', alignItems: 'stretch', overflow: 'hidden' },
  barcodeNum: { fontSize: 12, color: colors.inkSoft },
  paycardFoot: { padding: 14, backgroundColor: '#f3f6ff' },
  paycardFootText: { fontSize: 12.5, color: colors.inkSoft, textAlign: 'center' },
  chargeBox: { backgroundColor: '#fff', borderRadius: 18, padding: 16, marginTop: 14, ...shadow.sm },
  paycardCaption: { color: 'rgba(255,255,255,0.9)', fontSize: 13, textAlign: 'center', marginTop: 16, lineHeight: 18 },
  scanLink: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 24 },
  scanLinkText: { color: '#fff', fontWeight: '800', fontSize: 15 },

  scannerRoot: { flex: 1, backgroundColor: '#0b0b1a' },
  scannerOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(8,9,24,0.45)' },
  scannerContent: { flex: 1, paddingHorizontal: 18 },
  scanWindow: { width: 250, height: 250, alignSelf: 'center', marginTop: 20, alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 14 },
  corner: { position: 'absolute', width: 30, height: 30, borderColor: colors.sun },
  tl: { top: 0, left: 0, borderLeftWidth: 3, borderTopWidth: 3, borderTopLeftRadius: 8 },
  tr: { top: 0, right: 0, borderRightWidth: 3, borderTopWidth: 3, borderTopRightRadius: 8 },
  bl: { bottom: 0, left: 0, borderLeftWidth: 3, borderBottomWidth: 3, borderBottomLeftRadius: 8 },
  br: { bottom: 0, right: 0, borderRightWidth: 3, borderBottomWidth: 3, borderBottomRightRadius: 8 },
  scanHint: { color: '#fff', fontSize: 12.5, backgroundColor: 'rgba(0,0,0,0.35)', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 10, overflow: 'hidden' },
  permText: { color: '#fff', fontSize: 13, textAlign: 'center' },
  scannerActions: { flexDirection: 'row', justifyContent: 'center', gap: 20, marginBottom: 14 },
  scannerAct: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.16)', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 14 },
  scannerActText: { color: '#fff', fontWeight: '700' },
  scanResult: { backgroundColor: '#fff', borderRadius: 20, padding: 18, ...shadow.md },
  scanBadge: { color: colors.green, fontWeight: '800', textAlign: 'center' },
  scanPayee: { fontSize: 17, fontWeight: '800', color: colors.ink, textAlign: 'center', marginVertical: 10 },
  scanAgain: { color: colors.blueRoyal, fontWeight: '700', textAlign: 'center' },

  successCheck: { width: 88, height: 88, borderRadius: 44, backgroundColor: colors.green, alignItems: 'center', justifyContent: 'center', marginBottom: 18 },
  successTitle: { fontSize: 22, fontWeight: '800', color: colors.ink },
  successAmt: { fontSize: 32, fontWeight: '800', color: colors.blueRoyal, marginVertical: 6 },

  pillWrap: { flexDirection: 'row', marginBottom: 16 },
  pill: { backgroundColor: colors.blueTint, color: colors.blueRoyal, fontWeight: '600', fontSize: 13, paddingVertical: 7, paddingHorizontal: 15, borderRadius: 20, overflow: 'hidden' },
  commuteHint: { fontSize: 15, fontWeight: '700', color: colors.ink, marginHorizontal: 2, marginBottom: 12 },
  fareGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  fare: { width: '47.5%', backgroundColor: '#fff', borderWidth: 1.5, borderColor: colors.line, borderRadius: radius.md, paddingVertical: 16, alignItems: 'center', gap: 5, ...shadow.sm },
  fareMode: { fontWeight: '700', fontSize: 14, color: colors.ink },
  fareAmt: { fontSize: 13, color: colors.blueRoyal, fontWeight: '700' },
})
