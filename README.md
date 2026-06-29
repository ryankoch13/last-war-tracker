# Last War Alliance Tracker

A mobile companion app for managing alliance activity in **Last War: Survival**.  
The app helps alliance leadership track members, train assignments, events, donations, versus points, and other recurring alliance responsibilities in one place.

## Features

- Alliance member tracking
- Member detail screens with editable stats
- Daily donation and versus score entries
- Weekly activity views
- Train assignment board
- Train assignment history
- Alliance events tracking
- Persistent local storage
- Mobile-first UI built for quick alliance management

## Tech Stack

- React Native
- Expo
- Expo Router
- TypeScript
- Zustand
- MMKV storage

## Getting Started

### Prerequisites

Make sure you have the following installed:

- Node.js
- npm or yarn
- Expo CLI
- iOS Simulator or Android Emulator, or the Expo Go app

### Installation

Clone the repository:

```bash
git clone https://github.com/ryankoch13/last-war-tracker.git
cd last-war-tracker
```

Install dependencies:

```bash
yarn install
```

Or, with npm:

```bash
npm install
```

Start the development server:

```bash
yarn start
```

Or:

```bash
npx expo start
```

From the Expo terminal output, you can run the app on:

- iOS Simulator
- Android Emulator
- Expo Go
- Web

## Available Scripts

```bash
yarn start
```

Starts the Expo development server.

```bash
yarn ios
```

Starts the app in the iOS simulator.

```bash
yarn android
```

Starts the app in the Android emulator.

```bash
yarn web
```

Starts the web version of the app.

```bash
yarn lint
```

Runs Expo linting.

```bash
yarn reset-project
```

Resets the starter project structure.

## Project Structure

```text
last-war-tracker/
├── assets/              # App icons, splash assets, and static images
├── scripts/             # Project scripts
├── src/
│   ├── app/             # Expo Router routes and tab layout
│   ├── components/      # Reusable UI components
│   ├── constants/       # Shared constants
│   ├── data/            # Demo alliance data
│   ├── hooks/           # Shared hooks
│   ├── navigation/      # Navigation helpers
│   ├── screens/         # App screens
│   │   ├── events/      # Event list screens
│   │   ├── members/     # Member list, detail, and edit screens
│   │   └── trains/      # Train board screens
│   ├── store/           # Zustand state management
│   ├── theme/           # App colors and theme values
│   ├── types/           # TypeScript types
│   └── utils/           # Formatting and helper functions
├── App.tsx
├── app.json
├── package.json
└── tsconfig.json
```

## Core Data Models

The app currently tracks three main types of alliance information:

### Alliance Members

Members include:

- Username
- Alliance rank
- Power
- HQ level
- Main squad type
- Timezone
- Last active timestamp
- Weekly VS score
- Weekly donations
- Notes

### Alliance Events

Events include:

- Title
- Event type
- Start time
- Description
- Assigned members

Supported event types include:

- Desert Storm
- Alliance Duel
- Capital War
- Train
- Rare Soil War
- Custom

### Train Assignments

Train assignments include:

- Train name
- Departure time
- Conductor
- Guards
- Passengers
- Notes

## Current Status

This project is an early-stage alliance operations tracker. The foundation is in place for roster tracking, local persistence, demo data, train planning, and event visibility.

Future improvements could include:

- Full event creation and editing
- Train assignment creation and editing
- Member activity reminders
- Donation minimum tracking
- VS contribution history
- Alliance role permissions
- Cloud sync
- Import/export support
- Push notifications for events and trains
- Charts for power, donations, and VS trends

## Why I Built This

I built this as a practical tool for alliance leadership in Last War. R4s and R5s often need to make fast decisions about who is active, who is contributing, who should be assigned to events, and who needs reminders. This app is meant to make those decisions easier by keeping the important information in one place.

## Disclaimer

This is an unofficial fan-made project and is not affiliated with, endorsed by, or sponsored by Last War or its publishers.

## License

MIT
