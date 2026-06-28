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
