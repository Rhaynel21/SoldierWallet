# SoldierWallet

A GCash-inspired e-wallet app for soldiers, built with React + Vite.

## Features

- **Cash Wallet** — send money via e-wallet (GCash, Maya, etc.) or bank transfer.
- **Benefits Wallet** — spendable at accredited partners (medical, pharmacy, groceries, education, fuel, utilities) via QR vouchers.
- **QR Pay** (GCash-style):
  - **QR Reader** — real camera scanner (`jsQR`) with **Upload QR** from an image.
  - **My QR / Receive** — personal QR to receive money.
  - **Pay QR / Barcode** — show your code to a cashier.
  - **Benefits QR** — pay hospitals & partners using benefits.
- **Commute** — pay transport fare (jeepney, bus, MRT/LRT, etc.).
- **Activity** — full transaction history (persisted in `localStorage`).

Themed with a Philippine flag–inspired palette (royal blue, red, gold).

## Getting started

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173. The camera scanner requires `localhost` or HTTPS and camera permission.

## Tech

- React 18 + Vite 6
- react-router-dom, qrcode.react, jsqr
- State via React Context + reducer, persisted to `localStorage`

## Project structure

```
frontend/
  src/
    screens/      Home, Send, Benefits, QR, History
    components/   BottomNav, TransactionRow
    store/        WalletContext (state + reducer)
    utils/        formatting helpers
backend/          (reserved for a future API)
```
