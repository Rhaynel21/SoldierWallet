import { useState } from 'react'
import {
  Image,
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
import { peso } from '../utils/format.js'
import Dropdown from '../components/Dropdown.js'
import {
  AmountInput,
  BalancePill,
  Button,
  Field,
  Input,
  PageHeader,
  PhFlag,
} from '../components/ui.js'
import { colors, radius, shadow } from '../theme.js'

const ewallets = ['GCash', 'Maya', 'GrabPay', 'ShopeePay', 'Coins.ph']

// Partner banks. Add each bank's official logo file under assets/banks/ and
// register it in BANK_LOGOS below; until then a brand-colored badge is shown.
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

// Register official bank logos here, e.g. bpi: require('../../assets/banks/bpi.png')
const BANK_LOGOS = {}

const BANK_FEE = 15
const BANK_MAX = 50000
const norm = (s) => String(s || '').replace(/[\s-]/g, '').toLowerCase()

export default function SendScreen({ navigation, route }) {
  const [view, setView] = useState(route.params?.view || 'menu')

  const goHome = () => navigation.goBack()
  const goReceive = () =>
    navigation.navigate('Main', { screen: 'QR', params: { mode: 'receive' } })
  const goScan = () => navigation.navigate('Main', { screen: 'QR', params: { mode: 'scan' } })

  if (view === 'express') return <Express onBack={() => setView('menu')} goHome={goHome} goScan={goScan} />
  if (view === 'bank') return <Bank onBack={() => setView('menu')} goHome={goHome} goScan={goScan} />
  return <Menu onPick={setView} onBack={goHome} goReceive={goReceive} />
}

function Wrap({ children }) {
  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

/* Renders a bank's real logo (if registered) or a brand-colored badge. */
function BankLogo({ bank, size = 42 }) {
  const src = BANK_LOGOS[bank.logo]
  if (!src) {
    return (
      <View style={[styles.bankLogo, { backgroundColor: bank.color, width: size, height: size }]}>
        <Text style={styles.bankLogoText}>{bank.short}</Text>
      </View>
    )
  }
  return (
    <Image source={src} style={{ width: size, height: size, borderRadius: 10, resizeMode: 'contain', backgroundColor: '#fff' }} />
  )
}

/* ---------- Menu ---------- */
function Menu({ onPick, onBack, goReceive }) {
  const items = [
    { icon: 'send', title: 'Express Send', desc: 'Send money quickly', onPress: () => onPick('express'), section: 'Send to any e-wallet account' },
    { icon: 'business', title: 'Bank Transfer', desc: 'Send cash to any bank account', onPress: () => onPick('bank'), section: 'Send through our partners', help: 'Send to any of our 50+ partner banks all over the Philippines.' },
    { icon: 'qr-code', title: 'Generate QR', desc: 'Request easily using your QR code', onPress: goReceive, section: 'Request money' },
  ]
  return (
    <Wrap>
      <PageHeader title="Send" onBack={onBack} />
      {items.map((it) => (
        <View key={it.title}>
          <Text style={styles.sendSection}>{it.section}</Text>
          {it.help ? <Text style={styles.sendHelp}>{it.help}</Text> : null}
          <Pressable style={styles.sendItem} onPress={it.onPress}>
            <View style={styles.sendItemIcon}>
              <Ionicons name={it.icon} size={23} color={colors.blueRoyal} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.sendItemTitle}>{it.title}</Text>
              <Text style={styles.sendItemDesc}>{it.desc}</Text>
            </View>
          </Pressable>
        </View>
      ))}
    </Wrap>
  )
}

/* ---------- Success ---------- */
function Success({ done, onNew, label, goHome }) {
  return (
    <SafeAreaView style={[styles.root, styles.center]} edges={['top']}>
      <View style={styles.success}>
        <View style={styles.successCheck}>
          <Ionicons name="checkmark" size={46} color="#fff" />
        </View>
        <Text style={styles.successTitle}>{label} Successful</Text>
        <Text style={styles.successAmt}>{peso(done.amount)}</Text>
        <Text style={styles.successSub}>
          Sent to {done.name || done.account} · {done.provider}
        </Text>
        <View style={{ width: '100%', gap: 10, marginTop: 22 }}>
          <Button title="Back to Home" onPress={goHome} />
          <Button title="Send Again" variant="ghost" onPress={onNew} />
        </View>
      </View>
    </SafeAreaView>
  )
}

/* ---------- Express ---------- */
function Express({ onBack, goHome, goScan }) {
  const { cash, sendMoney, accounts, currentId } = useWallet()
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
      ? accounts.find((a) => a.id !== currentId && (norm(a.accountNo) === q || norm(a.mobile) === q))
      : null

  function reset() {
    setDone(null); setAccount(''); setName(''); setAmount(''); setNote('')
  }

  if (done) return <Success done={done} onNew={reset} label="Express Send" goHome={goHome} />

  return (
    <Wrap>
      <PageHeader title="Express Send" onBack={onBack} />
      <BalancePill>Available: {peso(cash)}</BalancePill>

      <Text style={styles.sendtoLabel}>Send to</Text>
      <View style={styles.sendtoRow}>
        <View style={styles.flagSelect}>
          <PhFlag />
          <Text style={styles.flagCaret}>▾</Text>
        </View>
        <TextInput
          style={styles.sendtoInput}
          placeholder="Enter name or number"
          placeholderTextColor={colors.inkFaint}
          value={account}
          onChangeText={setAccount}
        />
      </View>

      <Pressable style={styles.scanUpload} onPress={goScan}>
        <Ionicons name="qr-code-outline" size={18} color={colors.blueRoyal} />
        <Text style={styles.scanUploadText}>Scan/Upload QR</Text>
      </Pressable>

      {matched && (
        <View style={styles.matchChip}>
          <Text style={styles.matchText}>
            ✓ {matched.name} · SALUDO account — matatanggap nila agad ang pera.
          </Text>
        </View>
      )}

      <View style={{ gap: 15, marginTop: 20 }}>
        <Field label="E-Wallet">
          <Dropdown value={provider} options={ewallets} onChange={setProvider} label="E-Wallet" />
        </Field>
        <Field label="Recipient name (optional)">
          <Input placeholder="Juan Dela Cruz" value={name} onChangeText={setName} />
        </Field>
        <Field label="Amount" error={insufficient ? 'Insufficient balance' : null}>
          <AmountInput value={amount} onChangeText={setAmount} />
        </Field>
        <Field label="Note (optional)">
          <Input placeholder="For…" value={note} onChangeText={setNote} />
        </Field>
        <Button
          title={amt > 0 ? `Send ${peso(amt)}` : 'Send Money'}
          big
          disabled={!valid}
          onPress={() => {
            sendMoney({ channel: 'ewallet', provider, account, name, amount: amt, note })
            setDone({ provider, account, name, amount: amt })
          }}
        />
      </View>
    </Wrap>
  )
}

/* ---------- Bank Transfer (GCash-style) ---------- */
function Bank({ onBack, goHome, goScan }) {
  const { cash, sendMoney, accounts, currentId } = useWallet()
  const [step, setStep] = useState('pick')
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
    amt > 0 && !insufficient && !overMax &&
    accountDigits.length >= 10 && accountDigits.length <= 14 && name.trim().length > 0

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
    setDone(null); setAccount(''); setName(''); setAmount(''); setReceipt(''); setStep('pick')
  }

  if (done) return <Success done={done} onNew={reset} label="Bank Transfer" goHome={goHome} />

  if (step === 'pick') {
    const filtered = banks.filter((b) => b.name.toLowerCase().includes(query.trim().toLowerCase()))
    return (
      <Wrap>
        <PageHeader title="Bank Transfer" onBack={onBack} />
        <View style={styles.bankSearch}>
          <Ionicons name="search" size={16} color={colors.inkSoft} />
          <TextInput
            style={styles.bankSearchInput}
            placeholder="Search"
            placeholderTextColor={colors.inkFaint}
            value={query}
            onChangeText={setQuery}
          />
        </View>

        <View style={styles.bankHero}>
          <View style={{ flex: 1 }}>
            <Text style={styles.bankHeroTitle}>Easily transfer funds now!</Text>
            <Text style={styles.bankHeroSub}>Send cash to any partner bank account across the Philippines.</Text>
          </View>
          <Text style={{ fontSize: 40 }}>🏛️</Text>
        </View>

        <Pressable style={styles.bankScan} onPress={goScan}>
          <View style={styles.bankScanIcon}>
            <Ionicons name="qr-code-outline" size={22} color={colors.blueRoyal} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.sendItemTitle}>Scan/Upload Bank QR</Text>
            <Text style={styles.sendItemDesc}>Bank transfer by scanning or uploading a QR code.</Text>
          </View>
        </Pressable>

        <Text style={styles.bankListLabel}>Partner Banks</Text>
        <View style={styles.bankList}>
          {filtered.map((b, i) => (
            <Pressable
              key={b.key}
              style={[styles.bankRow, i === filtered.length - 1 && { borderBottomWidth: 0 }]}
              onPress={() => { setBank(b); setStep('details') }}
            >
              <BankLogo bank={b} />
              <Text style={styles.bankName}>{b.name}</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.inkFaint} />
            </Pressable>
          ))}
          {filtered.length === 0 && <Text style={styles.empty}>Walang bank na tumugma.</Text>}
        </View>
      </Wrap>
    )
  }

  return (
    <Wrap>
      <PageHeader title="Bank Transfer" onBack={() => setStep('pick')} />
      <View style={styles.bankDetailHead}>
        <BankLogo bank={bank} size={40} />
        <Text style={styles.bankDetailName}>{bank.name}</Text>
      </View>

      {recipient && (
        <View style={[styles.matchChip, { marginTop: 0, marginBottom: 14 }]}>
          <Text style={styles.matchText}>
            ✓ Papasok kay {recipient.name} — SALUDO account. Matatanggap nila agad ang pera.
          </Text>
        </View>
      )}

      <View style={{ gap: 15 }}>
        <Field label={`Amount (Max of ${peso(BANK_MAX)})`} error={insufficient ? 'Insufficient balance' : overMax ? `Exceeds ${peso(BANK_MAX)} limit` : null}>
          <AmountInput value={amount} onChangeText={setAmount} />
          <Text style={styles.bankAvail}>Available balance: {peso(cash)}</Text>
        </Field>
        <Field label="Account Name">
          <Input placeholder="Max of 50 characters" maxLength={50} value={name} onChangeText={setName} />
        </Field>
        <Field label="Account Number">
          <Input
            keyboardType="number-pad"
            placeholder="10 to 14 digits"
            maxLength={14}
            value={account}
            onChangeText={(t) => setAccount(t.replace(/\D/g, ''))}
          />
        </Field>
        <Field label="Send Receipt To (Optional)">
          <Input keyboardType="email-address" autoCapitalize="none" placeholder="name@email.com" value={receipt} onChangeText={setReceipt} />
        </Field>
        <Text style={styles.bankFee}>A {peso(BANK_FEE)} fee will be charged per transaction.</Text>
        <Button
          title="Send Money"
          big
          disabled={!valid}
          onPress={() => {
            sendMoney({ channel: 'bank', provider: bank.name, account, name, amount: amt, note: receipt ? `Receipt: ${receipt}` : '' })
            setDone({ provider: bank.name, account, name, amount: amt })
          }}
        />
      </View>
    </Wrap>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  center: { alignItems: 'center', justifyContent: 'center', padding: 22 },
  content: { padding: 18, paddingBottom: 40 },

  sendSection: { fontSize: 19, fontWeight: '800', color: colors.ink, marginTop: 16, marginBottom: 12, marginHorizontal: 2 },
  sendHelp: { fontSize: 13, color: colors.inkSoft, marginHorizontal: 2, marginBottom: 14, lineHeight: 20, marginTop: -4 },
  sendItem: {
    flexDirection: 'row', alignItems: 'center', gap: 15, backgroundColor: '#fff',
    borderWidth: 1, borderColor: colors.line, borderRadius: radius.md, padding: 16, ...shadow.sm,
  },
  sendItemIcon: {
    width: 52, height: 52, borderRadius: 13, backgroundColor: colors.blueTint2,
    alignItems: 'center', justifyContent: 'center',
  },
  sendItemTitle: { fontWeight: '800', fontSize: 17, color: colors.ink },
  sendItemDesc: { fontSize: 13, color: colors.inkSoft, marginTop: 2 },

  success: { alignItems: 'center', width: '100%' },
  successCheck: {
    width: 88, height: 88, borderRadius: 44, backgroundColor: colors.green,
    alignItems: 'center', justifyContent: 'center', marginBottom: 18,
  },
  successTitle: { fontSize: 22, fontWeight: '800', color: colors.ink },
  successAmt: { fontSize: 32, fontWeight: '800', color: colors.blueRoyal, marginVertical: 6 },
  successSub: { color: colors.inkSoft, textAlign: 'center' },

  sendtoLabel: { fontWeight: '800', fontSize: 16, marginHorizontal: 2, marginBottom: 10, color: colors.ink },
  sendtoRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1.5, borderColor: colors.line,
    backgroundColor: colors.field, borderRadius: 14, paddingHorizontal: 12,
  },
  flagSelect: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingRight: 10, borderRightWidth: 1, borderRightColor: colors.line, paddingVertical: 12 },
  flagCaret: { fontSize: 11, color: colors.inkSoft },
  sendtoInput: { flex: 1, fontSize: 15, color: colors.ink, paddingVertical: 12 },
  scanUpload: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 16 },
  scanUploadText: { color: colors.blueRoyal, fontWeight: '800', fontSize: 15 },
  matchChip: { backgroundColor: '#e9edff', borderWidth: 1, borderColor: '#cdd6ff', borderRadius: 12, padding: 11, marginTop: 14 },
  matchText: { color: colors.blueRoyal, fontSize: 12.5, lineHeight: 18 },

  bankSearch: {
    flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1.5, borderColor: colors.line,
    backgroundColor: colors.field, borderRadius: 14, paddingHorizontal: 14, marginBottom: 16,
  },
  bankSearchInput: { flex: 1, fontSize: 15, color: colors.ink, paddingVertical: 13 },
  bankHero: {
    flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#eef1ff',
    borderWidth: 1, borderColor: colors.line, borderRadius: radius.lg, padding: 16, marginBottom: 16,
  },
  bankHeroTitle: { fontSize: 17, fontWeight: '800', color: colors.blueRoyal },
  bankHeroSub: { fontSize: 12.5, color: colors.inkSoft, marginTop: 3, lineHeight: 17 },
  bankScan: {
    flexDirection: 'row', alignItems: 'center', gap: 15, backgroundColor: '#eef1ff',
    borderRadius: radius.md, padding: 16, marginBottom: 18,
  },
  bankScanIcon: { width: 46, height: 46, borderRadius: 12, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  bankListLabel: { fontSize: 13, fontWeight: '700', color: colors.inkSoft, marginHorizontal: 2, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
  bankList: { backgroundColor: '#fff', borderWidth: 1, borderColor: colors.line, borderRadius: radius.md, overflow: 'hidden', ...shadow.sm },
  bankRow: { flexDirection: 'row', alignItems: 'center', gap: 13, padding: 14, borderBottomWidth: 1, borderBottomColor: colors.line },
  bankLogo: { borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  bankLogoText: { color: '#fff', fontSize: 12, fontWeight: '800' },
  bankName: { flex: 1, fontWeight: '600', fontSize: 15, color: colors.ink },
  bankDetailHead: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingBottom: 16, marginBottom: 16, borderBottomWidth: 1, borderBottomColor: colors.line },
  bankDetailName: { fontSize: 18, fontWeight: '800', color: colors.ink, flex: 1 },
  bankAvail: { color: colors.blueRoyal, fontSize: 12.5, fontWeight: '700', marginTop: 6 },
  bankFee: { textAlign: 'center', fontSize: 13, fontWeight: '700', color: colors.inkSoft, marginTop: 2 },
  empty: { textAlign: 'center', color: colors.inkSoft, padding: 34 },
})
