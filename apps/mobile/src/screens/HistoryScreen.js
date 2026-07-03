import { useMemo, useState } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { useWallet } from '../store/WalletContext.js'
import TransactionRow from '../components/TransactionRow.js'
import { PageHeader } from '../components/ui.js'
import { colors, radius, shadow } from '../theme.js'

const filters = [
  { key: 'all', label: 'All' },
  { key: 'cash', label: 'Cash' },
  { key: 'benefits', label: 'Benefits' },
]

export default function HistoryScreen({ navigation }) {
  const { transactions } = useWallet()
  const [filter, setFilter] = useState('all')

  const list = useMemo(() => {
    if (filter === 'all') return transactions
    return transactions.filter((t) => t.wallet === filter)
  }, [transactions, filter])

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <PageHeader title="Activity" onBack={() => navigation.navigate('Home')} />

        <View style={styles.segmented}>
          {filters.map((f) => {
            const active = filter === f.key
            return (
              <Pressable
                key={f.key}
                style={[styles.seg, active && styles.segActive]}
                onPress={() => setFilter(f.key)}
              >
                <Text style={[styles.segText, active && styles.segTextActive]}>{f.label}</Text>
              </Pressable>
            )
          })}
        </View>

        <View style={styles.txList}>
          {list.length === 0 && <Text style={styles.empty}>No transactions yet.</Text>}
          {list.map((tx, i, arr) => (
            <TransactionRow key={tx.id} tx={tx} last={i === arr.length - 1} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 18, paddingBottom: 30, width: '100%', maxWidth: 520, alignSelf: 'center' },
  segmented: {
    flexDirection: 'row',
    backgroundColor: '#e6e8f2',
    borderRadius: 14,
    padding: 4,
    gap: 4,
    marginBottom: 18,
  },
  seg: { flex: 1, paddingVertical: 10, borderRadius: 11, alignItems: 'center' },
  segActive: { backgroundColor: '#fff', ...shadow.sm },
  segText: { fontWeight: '600', fontSize: 14, color: colors.inkSoft },
  segTextActive: { color: colors.blueRoyal },
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
