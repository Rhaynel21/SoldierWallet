import { useRef } from 'react'
import { Pressable, TextInput, View, Text, StyleSheet } from 'react-native'
import { colors, radius } from '../theme.js'

// 4-digit PIN entry shown as 4 boxes, backed by a single hidden numeric input.
export default function PinInput({ value, onChange, autoFocus }) {
  const ref = useRef(null)
  return (
    <Pressable style={styles.row} onPress={() => ref.current?.focus()}>
      {[0, 1, 2, 3].map((i) => {
        const active = value.length === i
        const filled = Boolean(value[i])
        return (
          <View
            key={i}
            style={[styles.box, active && styles.boxActive, filled && styles.boxFilled]}
          >
            <Text style={styles.dot}>{filled ? '•' : ''}</Text>
          </View>
        )
      })}
      <TextInput
        ref={ref}
        style={styles.hidden}
        keyboardType="number-pad"
        maxLength={4}
        value={value}
        autoFocus={autoFocus}
        onChangeText={(t) => onChange(t.replace(/\D/g, '').slice(0, 4))}
      />
    </Pressable>
  )
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 12 },
  box: {
    flex: 1,
    height: 56,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: colors.field,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxActive: { borderColor: colors.blueRoyal, backgroundColor: '#fff' },
  boxFilled: { borderColor: colors.blueRoyal },
  dot: { fontSize: 30, color: colors.ink, lineHeight: 34 },
  hidden: { position: 'absolute', opacity: 0, width: 1, height: 1 },
})
