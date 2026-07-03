import { useState } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'

import { useWallet } from '../store/WalletContext.js'
import { peso } from '../utils/format.js'
import TransactionRow from '../components/TransactionRow.js'
import Logo from '../components/Logo.js'
import { colors, radius, shadow } from '../theme.js'

const actions = [
  { key: 'send', label: 'Send', icon: 'send', target: 'Send', params: { view: 'menu' } },
  { key: 'benefits', label: 'Benefits', icon: 'shield-checkmark', target: 'Benefits' },
  { key: 'bank', label: 'Bank', icon: 'business', target: 'Send', params: { view: 'bank' } },
]

function initial(name) {
  const parts = String(name || '').trim().split(' ')
  const last = parts[parts.length - 1] || '?'
  return last[0] || '?'
}

export default function HomeScreen({ navigation }) {
  const { user, cash, benefits, transactions, logout } = useWallet()
  const [showCash, setShowCash] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Pressable style={styles.headerId} onPress={() => setMenuOpen((o) => !o)}>
            <View style={styles.avatar}>
              <Logo size={38} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.hello}>
                Mabuhay, {user.rank}! <Text style={styles.caret}>▾</Text>
              </Text>
              <Text style={styles.serial}>Account No. {user.accountNo || user.serialNo}</Text>
            </View>
          </Pressable>
        </View>

        {menuOpen && (
          <View style={styles.switcher}>
            <View style={styles.switcherHead}>
              <View style={styles.acctAvatar}>
                <Logo size={30} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.acctName}>{user.name}</Text>
                <Text style={styles.acctNo}>{user.mobile}</Text>
              </View>
            </View>
            <Pressable style={styles.logout} onPress={logout}>
              <Text style={styles.logoutText}>Log out</Text>
            </Pressable>
          </View>
        )}

        {/* Wallet card */}
        <View style={styles.walletCard}>
          <View style={styles.walletTop}>
            <Text style={styles.walletLabel}>Cash Wallet</Text>
            <Pressable onPress={() => setShowCash((s) => !s)}>
              <Text style={styles.eye}>{showCash ? 'Hide' : 'Show'}</Text>
            </Pressable>
          </View>
          <Text style={styles.walletBalance}>{showCash ? peso(cash) : '₱ ••••••'}</Text>
          <View style={styles.walletFoot}>
            <Text style={styles.walletUnit} numberOfLines={1}>{user.unit}</Text>
          </View>
        </View>

        {/* Benefits strip */}
        <Pressable style={styles.benefitStrip} onPress={() => navigation.navigate('Benefits')}>
          <View style={styles.benefitAccent} />
          <View style={styles.benefitIcon}>
            <Ionicons name="shield-checkmark" size={20} color={colors.red} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.benefitLabel}>Benefits Wallet</Text>
            <Text style={styles.benefitValue}>{peso(benefits)}</Text>
          </View>
          <Text style={styles.benefitCta}>Use QR ›</Text>
        </Pressable>

        {/* Quick actions */}
        <View style={styles.actions}>
          {actions.map((a) => (
            <Pressable
              key={a.key}
              style={styles.action}
              onPress={() => navigation.navigate(a.target, a.params)}
            >
              <View style={styles.actionIcon}>
                <Ionicons name={a.icon} size={22} color={colors.blueRoyal} />
              </View>
              <Text style={styles.actionLabel}>{a.label}</Text>
            </Pressable>
          ))}
        </View>

        {/* Recent */}
        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <Pressable onPress={() => navigation.navigate('History')}>
            <Text style={styles.link}>See all</Text>
          </Pressable>
        </View>
        <View style={styles.txList}>
          {transactions.length === 0 && <Text style={styles.empty}>No transactions yet.</Text>}
          {transactions.slice(0, 5).map((tx, i, arr) => (
            <TransactionRow key={tx.id} tx={tx} last={i === arr.length - 1} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 18, paddingBottom: 30 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  headerId: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    ...shadow.md,
  },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 20 },
  hello: { fontWeight: '700', fontSize: 17, color: colors.ink },
  caret: { color: colors.inkSoft },
  serial: { fontSize: 12, color: colors.inkSoft, marginTop: 1 },

  switcher: {
    backgroundColor: '#fff',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    marginBottom: 16,
    overflow: 'hidden',
    ...shadow.sm,
  },
  switcherHead: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  acctAvatar: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  acctName: { fontWeight: '700', fontSize: 14, color: colors.ink },
  acctNo: { fontSize: 12, color: colors.inkSoft },
  logout: { borderTopWidth: 1, borderTopColor: colors.line, padding: 14, alignItems: 'center' },
  logoutText: { color: colors.red, fontWeight: '800', fontSize: 15 },

  walletCard: {
    borderRadius: radius.xl,
    padding: 22,
    backgroundColor: colors.blueRoyal,
    ...shadow.blue,
  },
  walletTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  walletLabel: { color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: '600' },
  eye: { color: 'rgba(255,255,255,0.9)', fontSize: 13, fontWeight: '600' },
  walletBalance: { color: '#fff', fontSize: 34, fontWeight: '800', marginTop: 10, letterSpacing: -0.5 },
  walletFoot: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 },
  walletUnit: { color: 'rgba(255,255,255,0.85)', fontSize: 12, flex: 1, marginRight: 10 },
  brandChip: {
    backgroundColor: colors.sun,
    color: '#4a2c00',
    fontWeight: '800',
    fontSize: 12,
    paddingVertical: 4,
    paddingHorizontal: 11,
    borderRadius: 20,
    overflow: 'hidden',
  },

  benefitStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    marginTop: 14,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    padding: 15,
    overflow: 'hidden',
    ...shadow.sm,
  },
  benefitAccent: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 5, backgroundColor: colors.red },
  benefitIcon: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: '#fdecee',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  benefitLabel: { fontSize: 13, color: colors.inkSoft },
  benefitValue: { fontSize: 18, fontWeight: '800', color: colors.ink, marginTop: 2 },
  benefitCta: { color: colors.blueRoyal, fontWeight: '700', fontSize: 13 },

  actions: { flexDirection: 'row', gap: 10, marginVertical: 20 },
  action: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: 'center',
    gap: 9,
    ...shadow.sm,
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.blueTint2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: { fontSize: 12, color: colors.ink, fontWeight: '600' },

  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 10, marginHorizontal: 2 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: colors.ink },
  link: { color: colors.blueRoyal, fontWeight: '600', fontSize: 13 },
  txList: {
    backgroundColor: '#fff',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    overflow: 'hidden',
    ...shadow.sm,
  },
  empty: { textAlign: 'center', color: colors.inkSoft, padding: 34 },
})
