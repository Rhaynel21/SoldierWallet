# SALUDO

A GCash-inspired e-wallet for AFP personnel. This repo holds three parts:

| Folder        | What it is                                        | Stack                         |
| ------------- | ------------------------------------------------- | ----------------------------- |
| `apps/web`     | The web app                                       | React 18 + Vite 6             |
| `apps/mobile`  | The native iOS/Android app                        | React Native + Expo           |
| `apps/backend` | OTP (SMS) verification service                    | Node + Express (Semaphore)    |

The web and mobile apps share the same Firebase project, so data syncs between them.

## Features

- **Cash Wallet** — send money via e-wallet (GCash, Maya, etc.) or bank transfer.
- **Benefits Wallet** — spendable at accredited partners (medical, pharmacy, groceries, education, fuel, utilities) via QR vouchers.
- **QR Pay** — scan-to-pay reader, personal receive QR, pay QR/barcode for cashiers, and Benefits QR.
- **Commute** — pay transport fare (jeepney, bus, MRT/LRT, etc.).
- **Activity** — full transaction history.

Themed with a Philippine flag–inspired palette (royal blue, red, gold), flat/solid colors.

## Getting started

### Web + backend (run together)

```bash
npm run install:all     # installs root, backend, apps/web (and apps/mobile)
npm run dev             # runs backend + web via concurrently
```

Web dev server: http://localhost:5173. Camera scanner needs `localhost`/HTTPS + camera permission.

### Mobile

```bash
npm run mobile          # = expo start in apps/mobile
```

See [apps/mobile/README.md](apps/mobile/README.md) for full setup (Expo Go, `.env`, EAS builds).

## Project structure

```
apps/
  web/                Vite web app
    src/
      screens/        Home, Send, Benefits, QR, History, Profile, Auth, Splash
      components/     BottomNav, TransactionRow, Dropdown, PinInput, Logo…
      store/          WalletContext (state + reducer), persisted to localStorage
      utils/          formatting helpers
  mobile/             Expo (React Native) app
    src/
      screens/        same flows, native (React Navigation)
      components/      shared UI, StyleSheet theme
      store/          WalletContext, persisted to AsyncStorage
    assets/           app icon, adaptive icon, splash, brand logo
  backend/            Express OTP service (Semaphore SMS)
```
