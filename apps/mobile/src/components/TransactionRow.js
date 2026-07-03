import { StyleSheet, Text, View } from 'react-native'
import { peso, shortDate } from '../utils/format.js'
import { colors } from '../theme.js'

export default function TransactionRow({ tx, last }) {
  const sign = tx.direction === 'in' ? '+' : '−'
  return (
    <View style={[styles.row, last && styles.rowLast]}>
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
    paddingVertical: 14,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  rowLast: { borderBottomWidth: 0 },
  body: { flex: 1, minWidth: 0 },
  title: { fontWeight: '600', fontSize: 14, color: colors.ink },
  sub: { fontSize: 12, color: colors.inkSoft, marginTop: 1 },
  amount: { fontWeight: '700', fontSize: 14 },
})
