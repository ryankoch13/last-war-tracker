# Last War Alliance Tracker

A collaborative alliance management app for **Last War: Survival** players.

Last War Alliance Tracker is built for R4s, R5s, and alliance leadership teams who need a better way to manage members, track participation, organize train assignments, and monitor alliance activity in one place.

Built with **Expo**, **React Native**, **TypeScript**, **Expo Router**, **Zustand**, and **Supabase**.

---

## Features

- Supabase authentication
- Alliance creation and invite-code joining
- Shared alliance member list
- R1–R5 role tracking
- Member power, HQ level, and alliance notes
- Daily VS score and donation tracking
- Weekly and monthly stat summaries
- Alliance train assignment board
- Train assignment history
- Alliance event tracking
- Alliance-scoped data access with Supabase Row Level Security

---

## Tech Stack

- Expo
- React Native
- TypeScript
- Expo Router
- Zustand
- Supabase Auth
- Supabase Postgres
- Supabase Row Level Security

---

## Prerequisites

Before running the app locally, make sure you have the following installed:

- Node.js
- npm or Yarn
- Expo Go on your iOS or Android device

Optional, but recommended for simulator/emulator testing:

- Xcode for iOS Simulator
- Android Studio for Android Emulator

---

## Getting Started

Clone the repository:

```bash
git clone https://github.com/ryankoch13/last-war-tracker.git
cd last-war-tracker
```

Install dependencies:

```bash
npm install
```

Or, if you prefer Yarn:

```bash
yarn install
```

---

## Environment Variables

Create a `.env` file in the root of the project:

```bash
touch .env
```

Add your Supabase project values:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

You can find these values in your Supabase project under:

```txt
Project Settings > API
```

Make sure `.env` is included in `.gitignore` so your Supabase keys are not committed.

---

## Running the App Locally

Start the Expo development server:

```bash
npx expo start
```

Or use the npm script:

```bash
npm run start
```

Once Expo starts, you can:

- Scan the QR code with Expo Go on your phone
- Press `i` to open the iOS Simulator
- Press `a` to open the Android Emulator
- Press `w` to open the web version, if supported

---

## Platform Commands

Run on iOS:

```bash
npm run ios
```

Run on Android:

```bash
npm run android
```

Run on web:

```bash
npm run web
```

---

## Linting

Run Expo linting:

```bash
npm run lint
```

---

## Supabase Setup

This app expects a Supabase project with the required tables, authentication, and row-level security policies already configured.

The app currently uses tables such as:

- `alliances`
- `alliance_users`
- `members`
- `daily_member_stats`
- `train_assignments`
- `alliance_events`

Daily member totals are not stored directly on the `members` table. Weekly and monthly VS scores/donations are calculated from `daily_member_stats`.

This keeps member profile data separate from time-series performance data.

---

## Project Structure

```txt
last-war-tracker/
├── assets/              # App icons, splash assets, and images
├── scripts/             # Project scripts
├── src/
│   ├── app/             # Expo Router routes
│   ├── components/      # Shared UI components
│   ├── constants/       # App constants
│   ├── data/            # Static/demo data
│   ├── hooks/           # Custom React hooks
│   ├── navigation/      # Navigation helpers
│   ├── screens/         # App screens
│   ├── store/           # Zustand state management
│   ├── theme/           # Colors and styling helpers
│   ├── types/           # TypeScript types
│   └── utils/           # Formatting and utility functions
├── App.tsx
├── app.json
├── package.json
└── tsconfig.json
```

---

## Development Notes

This project uses Expo Router for navigation and Zustand for client-side state management.

Some features require a valid authenticated Supabase user and an active alliance membership. If the app loads but data does not appear, check:

- Your `.env` values are correct
- The Supabase project URL and anon key are valid
- Your Supabase tables exist
- RLS policies allow the signed-in user to access their alliance data
- The user has a row in the appropriate alliance membership table

---

## Troubleshooting

### Expo does not pick up environment variable changes

Stop the dev server and restart Expo with a cleared cache:

```bash
npx expo start -c
```

### Supabase imports are failing

Make sure the Supabase client package is installed:

```bash
npm install @supabase/supabase-js
```

Or with Yarn:

```bash
yarn add @supabase/supabase-js
```

### Dependency issues

Delete `node_modules` and reinstall:

```bash
rm -rf node_modules
npm install
```

Or with Yarn:

```bash
rm -rf node_modules
yarn install
```

### iOS or Android simulator does not open

Make sure Xcode or Android Studio is installed and configured correctly.

You can still run the app on a physical device using Expo Go.

---

## License

This project is licensed under the MIT License.
