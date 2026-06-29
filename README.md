<<<<<<< HEAD
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

=======
# Last War Tracker

A React Native alliance management app for **Last War** R4s and R5s who want a cleaner way to track alliance members, event prep, train assignments, and weekly contribution data.

Last War Tracker is designed to replace scattered notes, screenshots, and spreadsheets with one mobile-friendly place for alliance leadership to manage roster information and coordinate recurring alliance responsibilities.

## Overview

Alliance leadership in Last War can get messy fast. Between tracking member power, HQ levels, VS scores, donations, train assignments, Desert Storm prep, and event participation, important information often ends up spread across chat messages or manual spreadsheets.

This app gives R4/R5 leadership a simple operational dashboard for keeping alliance data organized and easy to review.

## Features

- **Alliance Dashboard**
  - View total alliance power
  - See top weekly VS contributors
  - Identify members with low weekly donations
  - Preview the next upcoming event
  - Review active train assignments

- **Member Roster**
  - Track usernames, rank, power, HQ level, main squad type, VS score, donations, and notes
  - Search members by username, rank, or squad type
  - Sort members by power
  - Add and edit member records

- **Event Tracking**
  - Track alliance events such as Desert Storm, Alliance Duel, Capital War, Rare Soil War, trains, and custom reminders
  - Assign members to events
  - Store event descriptions and start times

- **Train Board**
  - Track alliance train assignments
  - Assign conductors, guards, and passengers
  - Add notes for train coordination

- **Local Persistence**
  - Uses local device storage so alliance data remains available between app sessions

- **Demo Data**
  - Includes sample members, events, and train assignments to quickly preview the app experience

## Tech Stack

- **React Native**
- **Expo**
- **Expo Router**
- **TypeScript**
- **Zustand**
- **AsyncStorage**
- **React Navigation**
- **Expo Vector Icons**

## Getting Started

### Prerequisites

Make sure you have the following installed:

- Node.js
- Yarn or npm
- Expo CLI tooling
- iOS Simulator, Android Emulator, or Expo Go

### Installation

>>>>>>> main
Clone the repository:

```bash
git clone https://github.com/ryankoch13/last-war-tracker.git
cd last-war-tracker
```

Install dependencies:

```bash
<<<<<<< HEAD
npm install
```

Start the development server:

```bash
npx expo start
```

Then open the app using:

- Expo Go on a physical device
- iOS Simulator
- Android Emulator

## Project Structure

```txt
app/
  (tabs)/
    members/
    trains/
    events/
components/
store/
types/
utils/
```

## Current Status

This project is actively being developed as a portfolio project and practical alliance-management tool.  
The current version stores data locally on-device.

## Planned Improvements

- Backend database support
- User authentication
- Shared alliance workspaces
- Multi-user collaboration
- Cloud sync
- Alliance-level permissions
- Charts and trends for member activity
- Exportable reports

## Why I Built This

I built this app to solve a real coordination problem in **Last War: Survival** alliances.  
Alliance leaders often track member activity, train assignments, event participation, and donation expectations manually across spreadsheets, Discord, or in-game notes. This app brings those workflows into a dedicated mobile experience.

## Disclaimer

This project is an unofficial fan-made tool and is not affiliated with, endorsed by, or sponsored by Last War: Survival or its publishers.
=======
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
>>>>>>> main
