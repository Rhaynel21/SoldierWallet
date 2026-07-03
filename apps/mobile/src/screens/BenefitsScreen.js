import { useState } from 'react'
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import QRCode from 'react-native-qrcode-svg'
import { Ionicons } from '@expo/vector-icons'

import { useWallet } from '../store/WalletContext.js'
import { peso, shortDate } from '../utils/format.js'
import Dropdown from '../components/Dropdown.js'
import { AmountInput, BalancePill, Button, Field, PageHeader, SectionTitle } from '../components/ui.js'
import { colors, radius, shadow } from '../theme.js'

const categories = [
  { key: 'Medical', icon: 'medkit', label: 'Medical & Hospital', merchants: ['AFP Medical Center (V. Luna)', 'St. Luke’s Medical Center', 'Philippine General Hospital', 'Makati Medical Center'] },
  { key: 'Pharmacy', icon: 'medical', label: 'Pharmacy & Medicine', merchants: ['Mercury Drug', 'Watsons', 'Rose Pharmacy', 'Southstar Drug'] },
  { key: 'Groceries', icon: 'cart', label: 'Groceries & Supermarket', merchants: ['SM Supermarket', 'Puregold', 'Robinsons Supermarket', 'AFP Commissary'] },
  { key: 'Education', icon: 'school', label: 'Education & Tuition', merchants: ['AFP Educational Benefit', 'University of the Philippines', 'PUP', 'Local School'] },
  { key: 'Fuel & Transport', icon: 'car', label: 'Fuel & Transport', merchants: ['Petron', 'Shell', 'Caltex', 'Grab / Transport'] },
  { key: 'Utilities', icon: 'bulb', label: 'Utilities & Bills', merchants: ['Meralco', 'Maynilad', 'PLDT', 'Converge'] },
]

export default function BenefitsScreen({ navigation }) {
  const { benefits } = useWallet()
  const [openCat, setOpenCat] = useState(null)

  // Each category opens its own page (the QR generator for that category).
  if (openCat) {
    const category = categories.find((c) => c.key === openCat)
    return <CategoryPage category={category} onBack={() => setOpenCat(null)} />
  }

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <PageHeader title="Benefits" onBack={() => navigation.navigate('Home')} />

        <View style={styles.hero}>
          <Text style={styles.heroLabel}>AVAILABLE BENEFITS</Text>
          <Text style={styles.heroAmount}>{peso(benefits)}</Text>
          <Text style={styles.heroSub}>
            Spend your benefits at accredited partners — hospitals, pharmacies, groceries,
            schools, fuel and bills. Present a QR to pay.
          </Text>
        </View>

        <SectionTitle>What can I use it for?</SectionTitle>
        <View style={styles.catGrid}>
          {categories.map((c) => (
            <Pressable key={c.key} style={styles.cat} onPress={() => setOpenCat(c.key)}>
              <View style={styles.catIcon}>
                <Ionicons name={c.icon} size={22} color={colors.blueRoyal} />
              </View>
              <Text style={styles.catLabel}>{c.label}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
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

  function generate() {
    if (!valid) return
    createVoucher({ amount: amt, category: category.key, merchant })
    setAmount('')
  }

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <PageHeader title={category.label} onBack={onBack} />
          <BalancePill>Available: {peso(benefits)}</BalancePill>

          {active.length > 0 ? (
            <View>
              <SectionTitle>Ready to Present</SectionTitle>
              {active.map((v) => (
                <VoucherCard key={v.id} voucher={v} user={user} onCancel={() => cancelVoucher({ id: v.id })} />
              ))}
            </View>
          ) : (
            <View style={styles.cardForm}>
              <SectionTitle>Generate {category.key} QR</SectionTitle>
              <View style={{ gap: 15 }}>
                <Field label="Accredited partner">
                  <Dropdown value={merchant} options={category.merchants} onChange={setMerchant} label="Accredited partner" />
                </Field>
                <Field label="Amount to authorize" error={amt > benefits ? 'Exceeds available benefits' : null}>
                  <AmountInput value={amount} onChangeText={setAmount} />
                </Field>
                <Button title="Generate QR" variant="red" big disabled={!valid} onPress={generate} />
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
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
    <View style={styles.voucher}>
      <View style={styles.qrWrap}>
        <QRCode value={payload} size={196} color="#12128f" backgroundColor="#ffffff" />
      </View>
      <View style={{ marginTop: 15, alignItems: 'center' }}>
        <Text style={styles.voucherAmount}>{peso(voucher.amount)}</Text>
        <Text style={styles.voucherCat}>{voucher.category}</Text>
        <Text style={styles.voucherHospital}>{voucher.merchant}</Text>
        <Text style={styles.voucherId}>Voucher {voucher.id}</Text>
        <Text style={styles.voucherId}>Issued {shortDate(voucher.createdAt)}</Text>
      </View>
      <View style={styles.voucherHint}>
        <Ionicons name="camera-outline" size={15} color={colors.inkSoft} />
        <Text style={styles.voucherHintText}>
          Ask the cashier to scan this QR to charge your benefits.
        </Text>
      </View>
      <Button title="Cancel" variant="ghost" onPress={onCancel} />
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 18, paddingBottom: 40 },

  hero: { backgroundColor: colors.red, borderRadius: radius.lg, padding: 22, marginBottom: 20, overflow: 'hidden', ...shadow.red },
  heroLabel: { color: 'rgba(255,255,255,0.9)', fontSize: 12, fontWeight: '600', letterSpacing: 1 },
  heroAmount: { color: '#fff', fontSize: 34, fontWeight: '800', marginVertical: 6 },
  heroSub: { color: 'rgba(255,255,255,0.92)', fontSize: 13, lineHeight: 20, maxWidth: '88%' },

  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  cat: {
    width: '31.5%', backgroundColor: '#fff', borderWidth: 1.5, borderColor: colors.line,
    borderRadius: radius.md, paddingVertical: 13, paddingHorizontal: 6, alignItems: 'center', gap: 7, ...shadow.sm,
  },
  catIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#f4f5fb', alignItems: 'center', justifyContent: 'center' },
  catLabel: { fontSize: 11, fontWeight: '600', color: colors.ink, textAlign: 'center', lineHeight: 14 },

  cardForm: { backgroundColor: '#fff', borderWidth: 1, borderColor: colors.line, borderRadius: radius.lg, padding: 18, ...shadow.sm },

  voucher: { backgroundColor: '#fff', borderWidth: 1, borderColor: colors.line, borderRadius: radius.lg, padding: 20, alignItems: 'center', marginBottom: 12, ...shadow.md },
  qrWrap: { padding: 16, backgroundColor: '#fff', borderWidth: 3, borderColor: colors.sun, borderRadius: radius.md },
  voucherAmount: { fontSize: 27, fontWeight: '800', color: colors.red },
  voucherCat: {
    backgroundColor: colors.blueTint, color: colors.blueRoyal, fontSize: 11, fontWeight: '700',
    paddingVertical: 3, paddingHorizontal: 11, borderRadius: 12, marginVertical: 5, overflow: 'hidden',
    textTransform: 'uppercase', letterSpacing: 0.5,
  },
  voucherHospital: { fontWeight: '600', marginTop: 2, color: colors.ink },
  voucherId: { fontSize: 12, color: colors.inkSoft },
  voucherHint: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: '#f5f6fb', borderRadius: 11, padding: 10, marginVertical: 14, alignSelf: 'stretch' },
  voucherHintText: { fontSize: 12, color: colors.inkSoft, lineHeight: 18, flexShrink: 1 },
})
