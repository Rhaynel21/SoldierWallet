import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors, radius, shadow } from '../theme.js'

/* ---------- Button ---------- */
export function Button({ title, onPress, variant = 'primary', big, disabled, style }) {
  const v = BTN[variant] || BTN.primary
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      style={({ pressed }) => [
        styles.btn,
        big && styles.btnBig,
        { backgroundColor: v.bg },
        v.shadow,
        disabled && styles.btnDisabled,
        pressed && !disabled && styles.btnPressed,
        style,
      ]}
    >
      <Text style={[styles.btnText, { color: v.fg }]}>{title}</Text>
    </Pressable>
  )
}

const BTN = {
  primary: { bg: colors.blueRoyal, fg: '#fff', shadow: shadow.blue },
  red: { bg: colors.red, fg: '#fff', shadow: shadow.red },
  ghost: { bg: colors.blueTint, fg: colors.blueRoyal, shadow: null },
}

/* ---------- Page header (back + title) ---------- */
export function PageHeader({ title, onBack }) {
  return (
    <View style={styles.pageTop}>
      {onBack ? (
        <Pressable style={styles.back} onPress={onBack}>
          <Ionicons name="chevron-back" size={22} color={colors.blueRoyal} />
        </Pressable>
      ) : null}
      <Text style={styles.pageTitle}>{title}</Text>
    </View>
  )
}

/* ---------- Labeled field ---------- */
export function Field({ label, children, error }) {
  return (
    <View style={styles.field}>
      {label ? <Text style={styles.fieldLabel}>{label}</Text> : null}
      {children}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  )
}

export function Input(props) {
  return (
    <TextInput
      placeholderTextColor={colors.inkFaint}
      {...props}
      style={[styles.input, props.style]}
    />
  )
}

/* ---------- Amount input (₱ prefix) ---------- */
export function AmountInput({ value, onChangeText, autoFocus, placeholder = '0.00' }) {
  return (
    <View style={styles.amountBox}>
      <Text style={styles.peso}>₱</Text>
      <TextInput
        style={styles.amountInput}
        keyboardType="decimal-pad"
        placeholder={placeholder}
        placeholderTextColor={colors.inkFaint}
        value={value}
        onChangeText={onChangeText}
        autoFocus={autoFocus}
      />
    </View>
  )
}

export function BalancePill({ children }) {
  return (
    <View style={styles.pillWrap}>
      <Text style={styles.pill}>{children}</Text>
    </View>
  )
}

export function SectionTitle({ children, style }) {
  return <Text style={[styles.sectionTitle, style]}>{children}</Text>
}

// Small PH flag: blue top half, red bottom half (solid colors, no gradient).
export function PhFlag() {
  return (
    <View style={styles.flag}>
      <View style={styles.flagBlue} />
      <View style={styles.flagRed} />
    </View>
  )
}

const styles = StyleSheet.create({
  btn: {
    borderRadius: 14,
    paddingVertical: 13,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnBig: { paddingVertical: 16 },
  btnDisabled: { opacity: 0.45 },
  btnPressed: { opacity: 0.9 },
  btnText: { fontSize: 15, fontWeight: '700' },

  pageTop: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  back: {
    width: 38,
    height: 38,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.sm,
  },
  pageTitle: { fontSize: 21, fontWeight: '800', color: colors.ink },

  field: { gap: 7 },
  fieldLabel: { fontSize: 13, color: colors.inkSoft, fontWeight: '600' },
  input: {
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: colors.field,
    borderRadius: radius.sm,
    paddingVertical: 13,
    paddingHorizontal: 14,
    fontSize: 15,
    color: colors.ink,
  },
  errorText: { color: colors.red, fontSize: 12, fontWeight: '600' },

  amountBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: colors.field,
    borderRadius: radius.sm,
    paddingHorizontal: 14,
  },
  peso: { fontSize: 19, fontWeight: '700', color: colors.inkSoft },
  amountInput: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 8,
    fontSize: 21,
    fontWeight: '700',
    color: colors.ink,
  },

  pillWrap: { flexDirection: 'row', marginBottom: 16 },
  pill: {
    backgroundColor: colors.blueTint,
    color: colors.blueRoyal,
    fontWeight: '600',
    fontSize: 13,
    paddingVertical: 7,
    paddingHorizontal: 15,
    borderRadius: 20,
    overflow: 'hidden',
  },

  sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.ink, marginBottom: 12, marginHorizontal: 2 },

  flag: {
    width: 26,
    height: 17,
    borderRadius: 3,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
  },
  flagBlue: { flex: 1, backgroundColor: colors.blue },
  flagRed: { flex: 1, backgroundColor: colors.red },
})

export { styles as uiStyles }
