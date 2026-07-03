import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

import HomeScreen from '../screens/HomeScreen.js'
import BenefitsScreen from '../screens/BenefitsScreen.js'
import HistoryScreen from '../screens/HistoryScreen.js'
import ProfileScreen from '../screens/ProfileScreen.js'
import QRScreen from '../screens/QRScreen.js'
import SendScreen from '../screens/SendScreen.js'
import { colors } from '../theme.js'

const Stack = createNativeStackNavigator()
const Tab = createBottomTabNavigator()

const ICONS = {
  Home: 'home',
  Benefits: 'shield-checkmark',
  History: 'time',
  Profile: 'person',
}

// Raised center QR button
function QrTabButton({ children, onPress }) {
  return (
    <Pressable style={styles.centerWrap} onPress={onPress}>
      <View style={styles.centerBtn}>
        <Ionicons name="qr-code" size={26} color="#fff" />
      </View>
      <Text style={styles.centerLabel}>QR</Text>
    </Pressable>
  )
}

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.blueRoyal,
        tabBarInactiveTintColor: colors.inkFaint,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarIcon: ({ color, size, focused }) =>
          route.name === 'QR' ? null : (
            <Ionicons
              name={focused ? ICONS[route.name] : `${ICONS[route.name]}-outline`}
              size={size}
              color={color}
            />
          ),
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Benefits" component={BenefitsScreen} />
      <Tab.Screen
        name="QR"
        component={QRScreen}
        options={{
          tabBarLabel: '',
          tabBarButton: (props) => <QrTabButton {...props} />,
        }}
      />
      <Tab.Screen name="History" component={HistoryScreen} options={{ title: 'Activity' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  )
}

export default function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={Tabs} />
      <Stack.Screen name="Send" component={SendScreen} />
    </Stack.Navigator>
  )
}

const styles = StyleSheet.create({
  tabBar: {
    height: 64,
    paddingTop: 6,
    paddingBottom: 8,
    borderTopColor: colors.line,
    backgroundColor: 'rgba(255,255,255,0.98)',
  },
  centerWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  centerBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.blueRoyal,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -24,
    borderWidth: 4,
    borderColor: '#fff',
    shadowColor: colors.blueRoyal,
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  centerLabel: { fontSize: 11, fontWeight: '700', color: colors.blueRoyal, marginTop: 2 },
})
