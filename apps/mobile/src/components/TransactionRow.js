import { StyleSheet, Text, View } from 'react-native'
import { peso, shortDate } from '../utils/format.js'
import { colors } from '../theme.js'

const LABELS = {
  'cash-in': 'Cash In',
  'ewallet-transfer': 'E-Wallet',
  'bank-transfer': 'Bank',
  'benefit-payment': 'Benefits',
  'benefit-grant': 'Benefits',
  receive: 'Received',
  'qr-payment': 'QR Pay',
  commute: 'Commute',
}

export default function TransactionRow({ tx, last }) {
  const isIn = tx.direction === 'in'
  const sign = isIn ? '+' : '−'
  const label = tx.label || LABELS[tx.type] || 'Transaction'
  return (
    <View style={[styles.row, last && styles.rowLast]}>
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={1}>
          {tx.title}
        </Text>
        <View style={styles.metaRow}>
          <View style={[styles.label, isIn ? styles.labelIn : styles.labelOut]}>
            <Text style={[styles.labelText, { color: isIn ? colors.blueRoyal : colors.red }]}>
              {label}
            </Text>
          </View>
          <Text style={styles.sub} numberOfLines={1}>
            {tx.subtitle ? `${tx.subtitle} • ` : ''}
            {shortDate(tx.date)}
          </Text>
        </View>
        <Text style={styles.txid}>ID: {tx.id}</Text>
      </View>
      <Text style={[styles.amount, { color: isIn ? colors.green : colors.ink }]}>
        {sign} {peso(tx.amount)}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    paddingVertical: 14,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  rowLast: { borderBottomWidth: 0 },
  body: { flex: 1, minWidth: 0 },
  title: { fontWeight: '600', fontSize: 14, color: colors.ink },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3 },
  label: { paddingHorizontal: 6, paddingVertical: 1, borderRadius: 7 },
  labelIn: { backgroundColor: colors.blueTint },
  labelOut: { backgroundColor: colors.redTint },
  labelText: { fontSize: 9, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.4 },
  sub: { fontSize: 12, color: colors.inkSoft, flexShrink: 1 },
  txid: { fontSize: 10.5, color: colors.inkFaint, marginTop: 3, letterSpacing: 0.2 },
  amount: { fontWeight: '700', fontSize: 14 },
})
