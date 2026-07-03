import { useState } from 'react'
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors, radius, shadow } from '../theme.js'

// A tappable field that opens a bottom-sheet list of options.
export default function Dropdown({ value, options, onChange, label }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Pressable
        style={[styles.btn, open && styles.btnOpen]}
        onPress={() => setOpen(true)}
      >
        <Text style={styles.value} numberOfLines={1}>
          {value}
        </Text>
        <Ionicons name="chevron-down" size={16} color={colors.inkSoft} />
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            {label ? <Text style={styles.sheetTitle}>{label}</Text> : null}
            <ScrollView style={{ maxHeight: 360 }}>
              {options.map((opt) => {
                const selected = opt === value
                return (
                  <Pressable
                    key={opt}
                    style={[styles.opt, selected && styles.optActive]}
                    onPress={() => {
                      onChange(opt)
                      setOpen(false)
                    }}
                  >
                    <Text style={[styles.optText, selected && styles.optTextActive]}>
                      {opt}
                    </Text>
                    {selected && (
                      <Ionicons name="checkmark" size={18} color={colors.blueRoyal} />
                    )}
                  </Pressable>
                )
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  )
}

const styles = StyleSheet.create({
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: colors.field,
    borderRadius: radius.sm,
    paddingVertical: 13,
    paddingHorizontal: 14,
  },
  btnOpen: { borderColor: colors.blueRoyal, backgroundColor: '#fff' },
  value: { fontSize: 15, color: colors.ink, fontWeight: '600', flex: 1, marginRight: 8 },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(16,17,38,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    padding: 12,
    paddingBottom: 28,
    ...shadow.md,
  },
  sheetTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.inkSoft,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  opt: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 10,
  },
  optActive: { backgroundColor: '#eef0ff' },
  optText: { fontSize: 15, color: colors.ink },
  optTextActive: { color: colors.blueRoyal, fontWeight: '700' },
})
