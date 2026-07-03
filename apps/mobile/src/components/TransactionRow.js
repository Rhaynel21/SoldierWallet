import { StyleSheet, Text, View } from 'react-native'
import { peso, shortDate } from '../utils/format.js'
import { colors, radius } from '../theme.js'

const meta = {
  'cash-in': { icon: '↓', tint: 'green' },
  'ewallet-transfer': { icon: '↑', tint: 'blue' },
  'bank-transfer': { icon: '🏦', tint: 'blue' },
  'benefit-payment': { icon: '🏥', tint: 'red' },
  'benefit-grant': { icon: '🛡️', tint: 'gold' },
  receive: { icon: '↓', tint: 'green' },
  'qr-payment': { icon: '🏪', tint: 'blue' },
  commute: { icon: '🚌', tint: 'gold' },
}

const tints = {
  green: { bg: colors.greenTint, fg: colors.green },
  blue: { bg: colors.blueTint, fg: colors.blueRoyal },
  red: { bg: colors.redTint, fg: colors.red },
  gold: { bg: colors.goldTint, fg: colors.gold },
}

export default function TransactionRow({ tx, last }) {
  const m = meta[tx.type] || { icon: '•', tint: 'blue' }
  const t = tints[m.tint]
  const sign = tx.direction === 'in' ? '+' : '−'
  return (
    <View style={[styles.row, last && styles.rowLast]}>
      <View style={[styles.icon, { backgroundColor: t.bg }]}>
        <Text style={[styles.iconText, { color: t.fg }]}>{m.icon}</Text>
      </View>
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={1}>
          {tx.title}
        </Text>
        <Text style={styles.sub} numberOfLines={1}>
          {tx.subtitle ? `${tx.subtitle} • ` : ''}
          {shortDate(tx.date)}
        </Text>
      </View>
      <Text style={[styles.amount, { color: tx.direction === 'in' ? colors.green : colors.ink }]}>
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
    paddingVertical: 13,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  rowLast: { borderBottomWidth: 0 },
  icon: {
    width: 42,
    height: 42,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: { fontSize: 18, fontWeight: '700' },
  body: { flex: 1, minWidth: 0 },
  title: { fontWeight: '600', fontSize: 14, color: colors.ink },
  sub: { fontSize: 12, color: colors.inkSoft, marginTop: 1 },
  amount: { fontWeight: '700', fontSize: 14 },
})
