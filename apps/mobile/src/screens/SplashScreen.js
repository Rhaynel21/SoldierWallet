import { useEffect, useRef } from 'react'
import { Animated, StyleSheet, Text, View } from 'react-native'
import Logo from '../components/Logo.js'
import { colors } from '../theme.js'

export default function SplashScreen() {
  const scale = useRef(new Animated.Value(0.6)).current
  const opacity = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, friction: 5, tension: 80, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start()
  }, [opacity, scale])

  return (
    <View style={styles.root}>
      <Animated.View style={[styles.badge, { transform: [{ scale }], opacity }]}>
        <Logo size={140} />
      </Animated.View>
      <Animated.Text style={[styles.title, { opacity }]}>SALUDO</Animated.Text>
      <Text style={styles.tagline}>Built for those who serve.</Text>
      <Dots />
    </View>
  )
}

function Dots() {
  const dots = [useRef(new Animated.Value(0.3)).current, useRef(new Animated.Value(0.3)).current, useRef(new Animated.Value(0.3)).current]
  useEffect(() => {
    const anims = dots.map((d, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 150),
          Animated.timing(d, { toValue: 1, duration: 350, useNativeDriver: true }),
          Animated.timing(d, { toValue: 0.3, duration: 350, useNativeDriver: true }),
        ]),
      ),
    )
    anims.forEach((a) => a.start())
    return () => anims.forEach((a) => a.stop())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return (
    <View style={styles.dots}>
      {dots.map((d, i) => (
        <Animated.View key={i} style={[styles.dot, { opacity: d }]} />
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    width: 168,
    height: 168,
    borderRadius: 40,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.28,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 18 },
    elevation: 12,
  },
  title: {
    color: '#fff',
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: 2,
    marginTop: 20,
  },
  tagline: { color: 'rgba(255,255,255,0.85)', fontSize: 13, marginTop: 4 },
  dots: { flexDirection: 'row', gap: 7, marginTop: 26 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.9)' },
})
