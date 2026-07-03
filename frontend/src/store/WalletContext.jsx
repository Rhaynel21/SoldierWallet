import { createContext, useContext, useEffect, useMemo, useReducer } from 'react'

const WalletContext = createContext(null)

const STORAGE_KEY = 'soldier-wallet-state-v1'

const initialState = {
  user: {
    name: 'Sgt. Juan Dela Cruz',
    rank: 'Sergeant',
    serialNo: 'AFP-2019-88213',
    unit: '2nd Infantry Division',
  },
  cash: 12450.75,
  benefits: 50000.0,
  vouchers: [], // active benefit QR vouchers awaiting hospital scan
  transactions: [
    {
      id: 't-seed-1',
      type: 'cash-in',
      wallet: 'cash',
      title: 'Salary credit — AFP Finance',
      amount: 12000,
      direction: 'in',
      date: '2026-06-30T08:00:00.000Z',
    },
    {
      id: 't-seed-2',
      type: 'benefit-grant',
      wallet: 'benefits',
      title: 'Benefit allocation — AFP',
      amount: 50000,
      direction: 'in',
      date: '2026-06-01T08:00:00.000Z',
    },
  ],
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return initialState
    return { ...initialState, ...JSON.parse(raw) }
  } catch {
    return initialState
  }
}

function makeId(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`
}

function reducer(state, action) {
  switch (action.type) {
    case 'SEND_MONEY': {
      const { amount, channel, provider, account, name, note } = action.payload
      if (amount <= 0 || amount > state.cash) return state
      const tx = {
        id: makeId('t'),
        type: channel === 'bank' ? 'bank-transfer' : 'ewallet-transfer',
        wallet: 'cash',
        title:
          channel === 'bank'
            ? `Bank transfer — ${provider}`
            : `${provider} — ${name || account}`,
        subtitle: note || `Account ${account}`,
        amount,
        direction: 'out',
        date: new Date().toISOString(),
      }
      return {
        ...state,
        cash: +(state.cash - amount).toFixed(2),
        transactions: [tx, ...state.transactions],
      }
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
      return {
        ...state,
        cash: +(state.cash + amount).toFixed(2),
        transactions: [tx, ...state.transactions],
      }
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
      return {
        ...state,
        cash: +(state.cash + amount).toFixed(2),
        transactions: [tx, ...state.transactions],
      }
    }

    case 'PAY_MERCHANT': {
      const { amount, merchant } = action.payload
      if (amount <= 0 || amount > state.cash) return state
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
      return {
        ...state,
        cash: +(state.cash - amount).toFixed(2),
        transactions: [tx, ...state.transactions],
      }
    }

    case 'PAY_COMMUTE': {
      const { amount, mode } = action.payload
      if (amount <= 0 || amount > state.cash) return state
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
      return {
        ...state,
        cash: +(state.cash - amount).toFixed(2),
        transactions: [tx, ...state.transactions],
      }
    }

    case 'CREATE_VOUCHER': {
      const { amount, category, merchant } = action.payload
      if (amount <= 0 || amount > state.benefits) return state
      const voucher = {
        id: makeId('v'),
        amount,
        category: category || 'General',
        merchant: merchant || 'Any accredited establishment',
        serialNo: state.user.serialNo,
        soldier: state.user.name,
        status: 'active',
        createdAt: new Date().toISOString(),
      }
      return { ...state, vouchers: [voucher, ...state.vouchers] }
    }

    case 'REDEEM_VOUCHER': {
      const { id, merchantName } = action.payload
      const voucher = state.vouchers.find((v) => v.id === id)
      if (!voucher || voucher.status !== 'active') return state
      if (voucher.amount > state.benefits) return state
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
      return {
        ...state,
        benefits: +(state.benefits - voucher.amount).toFixed(2),
        vouchers: state.vouchers.map((v) =>
          v.id === id ? { ...v, status: 'redeemed', redeemedAt: tx.date } : v,
        ),
        transactions: [tx, ...state.transactions],
      }
    }

    case 'CANCEL_VOUCHER': {
      return {
        ...state,
        vouchers: state.vouchers.map((v) =>
          v.id === action.payload.id && v.status === 'active'
            ? { ...v, status: 'cancelled' }
            : v,
        ),
      }
    }

    case 'RESET':
      return initialState

    default:
      return state
  }
}

export function WalletProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadState)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  const value = useMemo(
    () => ({
      ...state,
      sendMoney: (payload) => dispatch({ type: 'SEND_MONEY', payload }),
      cashIn: (payload) => dispatch({ type: 'CASH_IN', payload }),
      receiveMoney: (payload) => dispatch({ type: 'RECEIVE_MONEY', payload }),
      payMerchant: (payload) => dispatch({ type: 'PAY_MERCHANT', payload }),
      payCommute: (payload) => dispatch({ type: 'PAY_COMMUTE', payload }),
      createVoucher: (payload) => dispatch({ type: 'CREATE_VOUCHER', payload }),
      redeemVoucher: (payload) => dispatch({ type: 'REDEEM_VOUCHER', payload }),
      cancelVoucher: (payload) => dispatch({ type: 'CANCEL_VOUCHER', payload }),
      reset: () => dispatch({ type: 'RESET' }),
    }),
    [state],
  )

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
}

export function useWallet() {
  const ctx = useContext(WalletContext)
  if (!ctx) throw new Error('useWallet must be used within WalletProvider')
  return ctx
}
