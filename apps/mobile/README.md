# SALUDO — Mobile (React Native / Expo)

Native iOS + Android app converted from the web version. Same features:
MPIN login & sign-up (with optional SMS OTP), Cash + Benefits wallets, Send
(e-wallet / bank), QR pay & receive, benefit vouchers, commute fares, and
activity history. Data syncs through the same Firebase project as the web app.

## Prerequisites

- Node.js 18+
- The **Expo Go** app on your phone (or an Android/iOS emulator)

## Setup

```bash
cd apps/mobile
npm install
cp .env.example .env      # then fill in the Firebase web keys
```

Fill `.env`:

- `EXPO_PUBLIC_FIREBASE_API_KEY` / `EXPO_PUBLIC_FIREBASE_APP_ID` — from the
  Firebase console (Project settings → your **Web** app). Without these the app
  still runs, but data stays on-device only (no cloud sync).
- `EXPO_PUBLIC_API_BASE` — the OTP backend URL, e.g. `http://192.168.1.20:3001`
  (your computer's LAN IP so a physical phone can reach it). Leave blank to skip
  OTP — sign-up then creates the account directly.

If versions ever mismatch, run `npx expo install --fix`.

## Run

```bash
npm start          # opens Expo Dev Tools; scan the QR with Expo Go
npm run android    # or launch straight to an Android emulator
npm run ios        # or an iOS simulator (macOS only)
```

## Notes on the conversion

- **Navigation** — React Navigation (native stack + bottom tabs with a raised
  center QR button) replaces `react-router-dom`.
- **Storage** — `@react-native-async-storage/async-storage` replaces
  `localStorage`; the store hydrates asynchronously on launch.
- **QR** — `expo-camera`'s built-in barcode scanner replaces `jsQR`;
  `react-native-qrcode-svg` replaces `qrcode.react`.
- **Styling** — `StyleSheet` objects replace `styles.css`; all colors are solid
  (no gradients), matching the flat SALUDO look.
- **Logo/splash** — the brand shield is bundled as native `assets/` (icon,
  adaptive icon, splash) and shown on the in-app splash.

## Building for stores (EAS)

The `eas.projectId` is already set in `app.json`. In your own terminal:

```bash
npm i -g eas-cli
eas login
eas build --platform android    # or ios
```
