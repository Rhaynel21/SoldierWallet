import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { collection, doc, onSnapshot, setDoc } from 'firebase/firestore'
import { db, firebaseEnabled } from '../firebase.js'

const WalletContext = createContext(null)
const ACCOUNTS_COL = 'accounts'
const STORAGE_KEY = 'soldier-wallet-state-v4'

function seedAccount(over) {
  return {
    vouchers: [],
    transactions: [],
    ...over,
  }
}

const initialState = {
  authedId: null,
  currentId: null,
  lastPhone: '',
  accounts: [], // everyone signs up (stored in Firestore)
}

function makeId(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`
}

const round = (n) => +Number(n).toFixed(2)
const norm = (s) => String(s || '').replace(/[\s-]/g, '').toLowerCase()
const phone10 = (s) => String(s || '').replace(/\D/g, '').slice(-10)

function genAccountNo() {
  let digits = '20'
  for (let i = 0; i < 10; i++) digits += Math.floor(Math.random() * 10)
  return `${digits.slice(0, 4)} ${digits.slice(4, 8)} ${digits.slice(8, 12)}`
}
function genSerialNo() {
  return `AFP-${2015 + Math.floor(Math.random() * 11)}-${10000 + Math.floor(Math.random() * 89999)}`
}

function getCurrent(state) {
  return state.accounts.find((a) => a.id === state.currentId)
}

function updateCurrent(state, updater) {
  return {
    ...state,
    accounts: state.accounts.map((a) => (a.id === state.currentId ? updater(a) : a)),
  }
}

function findRecipient(accounts, excludeId, query, nameQuery) {
  const q = norm(query)
  const nq = norm(nameQuery)
  return (
    accounts.find((a) => {
      if (a.id === excludeId) return false
      if (q && (norm(a.accountNo) === q || norm(a.mobile) === q || norm(a.serialNo) === q))
        return true
      if (nq && norm(a.name).includes(nq) && nq.length >= 3) return true
      return false
    }) || null
  )
}

function reducer(state, action) {
  const cur = getCurrent(state)

  switch (action.type) {
    case 'HYDRATE':
      return { ...initialState, ...action.payload, accounts: action.payload.accounts || [] }

    case 'SWITCH_ACCOUNT':
      return state.accounts.some((a) => a.id === action.payload.id)
        ? { ...state, currentId: action.payload.id }
        : state

    case 'SET_AUTH': {
      const acc = state.accounts.find((a) => a.id === action.payload.id)
      return {
        ...state,
        authedId: action.payload.id,
        currentId: action.payload.id,
        lastPhone: acc ? acc.mobile : state.lastPhone,
      }
    }

    case 'LOGOUT':
      return { ...state, authedId: null }

    case 'RESET_PIN':
      return {
        ...state,
        accounts: state.accounts.map((a) =>
          phone10(a.mobile) === phone10(action.payload.phone)
            ? { ...a, pin: String(action.payload.newPin) }
            : a,
        ),
      }

    case 'SIGNUP': {
      const { name, rank, phone, pin } = action.payload
      const id = makeId('acc')
      const account = seedAccount({
        id,
        name,
        rank,
        serialNo: genSerialNo(),
        accountNo: genAccountNo(),
        mobile: phone,
        pin,
        unit: 'Armed Forces of the Philippines',
        cash: 0,
        benefits: 0,
        transactions: [],
      })
      return {
        ...state,
        accounts: [...state.accounts, account],
        authedId: id,
        currentId: id,
        lastPhone: account.mobile,
      }
    }

    case 'SEND_MONEY': {
      const { amount, channel, provider, account, name, note } = action.payload
      if (amount <= 0 || amount > cur.cash) return state

      const recipient = findRecipient(state.accounts, cur.id, account, name)
      const internal = Boolean(recipient)

      const outTx = {
        id: makeId('t'),
        type: channel === 'bank' ? 'bank-transfer' : 'ewallet-transfer',
        wallet: 'cash',
        title: internal
          ? `Sent to ${recipient.name}`
          : channel === 'bank'
            ? `Bank transfer — ${provider}`
            : `${provider} — ${name || account}`,
        subtitle: note || (internal ? 'SALUDO transfer' : `Account ${account}`),
        amount,
        direction: 'out',
        date: new Date().toISOString(),
      }

      let accounts = state.accounts.map((a) =>
        a.id === cur.id
          ? { ...a, cash: round(a.cash - amount), transactions: [outTx, ...a.transactions] }
          : a,
      )

      if (internal) {
        const inTx = {
          id: makeId('t'),
          type: 'receive',
          wallet: 'cash',
          title: `Received from ${cur.name}`,
          subtitle: note || 'SALUDO transfer',
          amount,
          direction: 'in',
          date: outTx.date,
        }
        accounts = accounts.map((a) =>
          a.id === recipient.id
            ? { ...a, cash: round(a.cash + amount), transactions: [inTx, ...a.transactions] }
            : a,
        )
      }

      return { ...state, accounts }
    }

    case 'CASH_IN': {
      const { amount } = action.payload
      if (amount <= 0) return state
      const tx = {
        id: makeId('t'),
        type: 'cash-in',
        wallet: 'cash',
        title: 'Cash In',
        amount,
        direction: 'in',
        date: new Date().toISOString(),
      }
      return updateCurrent(state, (a) => ({
        ...a,
        cash: round(a.cash + amount),
        transactions: [tx, ...a.transactions],
      }))
    }

    case 'RECEIVE_MONEY': {
      const { amount, from } = action.payload
      if (amount <= 0) return state
      const tx = {
        id: makeId('t'),
        type: 'receive',
        wallet: 'cash',
        title: `Received from ${from || 'Sender'}`,
        subtitle: 'Via QR',
        amount,
        direction: 'in',
        date: new Date().toISOString(),
      }
      return updateCurrent(state, (a) => ({
        ...a,
        cash: round(a.cash + amount),
        transactions: [tx, ...a.transactions],
      }))
    }

    case 'PAY_MERCHANT': {
      const { amount, merchant } = action.payload
      if (amount <= 0 || amount > cur.cash) return state
      const tx = {
        id: makeId('t'),
        type: 'qr-payment',
        wallet: 'cash',
        title: `Paid ${merchant || 'Merchant'}`,
        subtitle: 'Scan to Pay',
        amount,
        direction: 'out',
        date: new Date().toISOString(),
      }
      return updateCurrent(state, (a) => ({
        ...a,
        cash: round(a.cash - amount),
        transactions: [tx, ...a.transactions],
      }))
    }

    case 'PAY_COMMUTE': {
      const { amount, mode } = action.payload
      if (amount <= 0 || amount > cur.cash) return state
      const tx = {
        id: makeId('t'),
        type: 'commute',
        wallet: 'cash',
        title: `Fare — ${mode || 'Transport'}`,
        subtitle: 'Commute QR',
        amount,
        direction: 'out',
        date: new Date().toISOString(),
      }
      return updateCurrent(state, (a) => ({
        ...a,
        cash: round(a.cash - amount),
        transactions: [tx, ...a.transactions],
      }))
    }

    case 'CREATE_VOUCHER': {
      const { amount, category, merchant } = action.payload
      if (amount <= 0 || amount > cur.benefits) return state
      const voucher = {
        id: makeId('v'),
        amount,
        category: category || 'General',
        merchant: merchant || 'Any accredited establishment',
        serialNo: cur.serialNo,
        soldier: cur.name,
        status: 'active',
        createdAt: new Date().toISOString(),
      }
      return updateCurrent(state, (a) => ({ ...a, vouchers: [voucher, ...a.vouchers] }))
    }

    case 'REDEEM_VOUCHER': {
      const { id, merchantName } = action.payload
      const voucher = cur.vouchers.find((v) => v.id === id)
      if (!voucher || voucher.status !== 'active' || voucher.amount > cur.benefits) return state
      const tx = {
        id: makeId('t'),
        type: 'benefit-payment',
        wallet: 'benefits',
        title: `${voucher.category} — ${merchantName || voucher.merchant}`,
        subtitle: `Benefit voucher ${voucher.id}`,
        amount: voucher.amount,
        direction: 'out',
        date: new Date().toISOString(),
      }
      return updateCurrent(state, (a) => ({
        ...a,
        benefits: round(a.benefits - voucher.amount),
        vouchers: a.vouchers.map((v) =>
          v.id === id ? { ...v, status: 'redeemed', redeemedAt: tx.date } : v,
        ),
        transactions: [tx, ...a.transactions],
      }))
    }

    case 'CANCEL_VOUCHER':
      return updateCurrent(state, (a) => ({
        ...a,
        vouchers: a.vouchers.map((v) =>
          v.id === action.payload.id && v.status === 'active' ? { ...v, status: 'cancelled' } : v,
        ),
      }))

    case 'UPDATE_LOCATION':
      return updateCurrent(state, (a) => ({
        ...a,
        location: {
          lat: action.payload.lat,
          lng: action.payload.lng,
          accuracy: action.payload.accuracy ?? null,
          updatedAt: action.payload.updatedAt,
        },
      }))

    case 'REPLACE_ACCOUNTS':
      return { ...state, accounts: action.payload.accounts }

    case 'RESET':
      return initialState

    default:
      return state
  }
}

export function WalletProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  const [hydrated, setHydrated] = useState(false)
  const seededRef = useRef(false)
  const applyingRemoteRef = useRef(false)

  // Hydrate from AsyncStorage on first mount (async equivalent of loadState).
  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY)
        if (active && raw) dispatch({ type: 'HYDRATE', payload: JSON.parse(raw) })
      } catch {
        // ignore — start fresh
      } finally {
        if (active) setHydrated(true)
      }
    })()
    return () => {
      active = false
    }
  }, [])

  // Local cache (offline fallback). Skip until hydrated to avoid clobbering.
  useEffect(() => {
    if (!hydrated) return
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => {})
  }, [state, hydrated])

  // Firestore: live subscribe to all accounts (seed if empty)
  useEffect(() => {
    if (!hydrated || !firebaseEnabled || !db) return
    const unsub = onSnapshot(
      collection(db, ACCOUNTS_COL),
      (snap) => {
        if (snap.empty && !seededRef.current) {
          seededRef.current = true
          state.accounts.forEach((a) => setDoc(doc(db, ACCOUNTS_COL, a.id), a).catch(() => {}))
          return
        }
        if (!snap.empty) {
          seededRef.current = true
          applyingRemoteRef.current = true
          dispatch({
            type: 'REPLACE_ACCOUNTS',
            payload: { accounts: snap.docs.map((d) => d.data()) },
          })
        }
      },
      (err) => console.warn('Firestore snapshot error:', err.message),
    )
    return () => unsub()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated])

  // Firestore: write-through every account change
  useEffect(() => {
    if (!hydrated || !firebaseEnabled || !db) return
    if (applyingRemoteRef.current) {
      applyingRemoteRef.current = false
      return
    }
    state.accounts.forEach((a) => setDoc(doc(db, ACCOUNTS_COL, a.id), a).catch(() => {}))
  }, [state.accounts, hydrated])

  const value = useMemo(() => {
    const cur = getCurrent(state) || {}
    return {
      hydrated,
      user: {
        name: cur.name || '',
        rank: cur.rank || '',
        serialNo: cur.serialNo || '',
        accountNo: cur.accountNo || '',
        mobile: cur.mobile || '',
        unit: cur.unit || '',
      },
      cash: cur.cash || 0,
      benefits: cur.benefits || 0,
      vouchers: cur.vouchers || [],
      transactions: cur.transactions || [],
      authedId: state.authedId,
      lastPhone: state.lastPhone,
      login: ({ phone, pin }) => {
        const acc = state.accounts.find(
          (a) => phone10(a.mobile) === phone10(phone) && a.pin === String(pin),
        )
        if (!acc) return { ok: false, error: 'Maling phone number o PIN.' }
        // Admin / superadmin accounts are web-only (they use the web dashboard).
        if (acc.role === 'admin' || acc.role === 'superadmin')
          return { ok: false, error: 'Admin account — mag-login sa web dashboard.' }
        dispatch({ type: 'SET_AUTH', payload: { id: acc.id } })
        return { ok: true }
      },
      signup: ({ name, rank, phone, pin }) => {
        if (!name.trim()) return { ok: false, error: 'Ilagay ang buong pangalan.' }
        if (phone10(phone).length < 10) return { ok: false, error: 'Maling phone number.' }
        if (String(pin).length < 4) return { ok: false, error: 'Dapat 4-digit ang PIN.' }
        if (state.accounts.some((a) => phone10(a.mobile) === phone10(phone)))
          return { ok: false, error: 'Naka-register na ang number na ito.' }
        dispatch({ type: 'SIGNUP', payload: { name, rank, phone, pin } })
        return { ok: true }
      },
      logout: () => dispatch({ type: 'LOGOUT' }),
      resetPin: ({ phone, newPin }) => {
        const acc = state.accounts.find((a) => phone10(a.mobile) === phone10(phone))
        if (!acc) return { ok: false, error: 'Walang account na naka-register sa number na ito.' }
        if (String(newPin).length !== 4) return { ok: false, error: 'Dapat 4-digit ang PIN.' }
        dispatch({ type: 'RESET_PIN', payload: { phone, newPin } })
        return { ok: true }
      },
      currentId: state.currentId,
      accounts: state.accounts.map((a) => ({
        id: a.id,
        name: a.name,
        rank: a.rank,
        accountNo: a.accountNo,
        mobile: a.mobile,
        cash: a.cash,
      })),
      switchAccount: (id) => dispatch({ type: 'SWITCH_ACCOUNT', payload: { id } }),
      updateLocation: (payload) => dispatch({ type: 'UPDATE_LOCATION', payload }),
      sendMoney: (payload) => dispatch({ type: 'SEND_MONEY', payload }),
      cashIn: (payload) => dispatch({ type: 'CASH_IN', payload }),
      receiveMoney: (payload) => dispatch({ type: 'RECEIVE_MONEY', payload }),
      payMerchant: (payload) => dispatch({ type: 'PAY_MERCHANT', payload }),
      payCommute: (payload) => dispatch({ type: 'PAY_COMMUTE', payload }),
      createVoucher: (payload) => dispatch({ type: 'CREATE_VOUCHER', payload }),
      redeemVoucher: (payload) => dispatch({ type: 'REDEEM_VOUCHER', payload }),
      cancelVoucher: (payload) => dispatch({ type: 'CANCEL_VOUCHER', payload }),
      reset: () => dispatch({ type: 'RESET' }),
    }
  }, [state, hydrated])

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
}

export function useWallet() {
  const ctx = useContext(WalletContext)
  if (!ctx) throw new Error('useWallet must be used within WalletProvider')
  return ctx
}
