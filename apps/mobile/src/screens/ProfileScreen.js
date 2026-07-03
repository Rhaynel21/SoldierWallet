import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { useWallet } from '../store/WalletContext.js'
import { peso } from '../utils/format.js'
import { PageHeader } from '../components/ui.js'
import { colors, radius, shadow } from '../theme.js'

function initial(name) {
  const parts = String(name || '').trim().split(' ')
  const last = parts[parts.length - 1] || '?'
  return last[0] || '?'
}

export default function ProfileScreen({ navigation }) {
  const { user, cash, benefits, transactions, logout } = useWallet()

  const rows = [
    { label: 'Account No.', value: user.accountNo },
    { label: 'Mobile No.', value: user.mobile },
    { label: 'Serial No.', value: user.serialNo },
    { label: 'Rank', value: user.rank },
    { label: 'Unit', value: user.unit },
    { label: 'Transactions', value: String(transactions.length) },
  ]

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <PageHeader title="Profile" onBack={() => navigation.navigate('Home')} />

        <View style={styles.head}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initial(user.name)}</Text>
          </View>
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.rank}>
            {user.rank} · {user.unit}
          </Text>
        </View>

        <View style={styles.balances}>
          <View style={styles.bal}>
            <Text style={styles.balLabel}>Cash Wallet</Text>
            <Text style={[styles.balValue, { color: colors.blueRoyal }]}>{peso(cash)}</Text>
          </View>
          <View style={styles.bal}>
            <Text style={styles.balLabel}>Benefits</Text>
            <Text style={[styles.balValue, { color: colors.red }]}>{peso(benefits)}</Text>
          </View>
        </View>

        <View style={styles.list}>
          {rows.map((r, i) => (
            <View key={r.label} style={[styles.row, i === rows.length - 1 && styles.rowLast]}>
              <Text style={styles.rowLabel}>{r.label}</Text>
              <Text style={styles.rowValue}>{r.value}</Text>
            </View>
          ))}
        </View>

        <Pressable style={styles.logout} onPress={logout}>
          <Text style={styles.logoutText}>Log out</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 18, paddingBottom: 30, width: '100%', maxWidth: 520, alignSelf: 'center' },
  head: { alignItems: 'center', paddingBottom: 20 },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 26,
    backgroundColor: colors.blueRoyal,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    ...shadow.blue,
  },
  avatarText: { color: '#fff', fontSize: 34, fontWeight: '800' },
  name: { fontSize: 21, fontWeight: '800', color: colors.ink },
  rank: { fontSize: 13, color: colors.inkSoft, marginTop: 2 },

  balances: { flexDirection: 'row', gap: 12, marginBottom: 18 },
  bal: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    padding: 14,
    ...shadow.sm,
  },
  balLabel: { fontSize: 12, color: colors.inkSoft },
  balValue: { fontSize: 19, fontWeight: '800', marginTop: 4 },

  list: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    overflow: 'hidden',
    marginBottom: 18,
    ...shadow.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  rowLast: { borderBottomWidth: 0 },
  rowLabel: { fontSize: 13, color: colors.inkSoft },
  rowValue: { fontSize: 14, fontWeight: '600', color: colors.ink, textAlign: 'right', flex: 1, marginLeft: 12 },

  logout: {
    borderWidth: 1,
    borderColor: '#f4c4c9',
    backgroundColor: '#fdeef0',
    borderRadius: 14,
    padding: 15,
    alignItems: 'center',
  },
  logoutText: { color: colors.red, fontWeight: '800', fontSize: 15 },
})
