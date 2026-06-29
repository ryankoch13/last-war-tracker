# Last War Alliance Tracker

A collaborative alliance management app for Last War players. Built with Expo, React Native, TypeScript, Zustand, and Supabase.

## Features

- Supabase authentication
- Alliance creation and invite-code joining
- Shared alliance member list
- R1-R5 role tracking
- Member power, HQ level, and R4 notes
- Daily VS score and donation tracking
- Weekly and monthly stat summaries
- Alliance train assignment board
- Alliance event tracking
- Row-level security for alliance-scoped data

## Tech Stack

- Expo / React Native
- TypeScript
- Expo Router
- Zustand
- Supabase Auth
- Supabase Postgres
- Supabase Row-Level Security

## Local Setup

1. Install dependencies

```bash
npm install
```

2.  Create a .env file

```EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Start the app

```npx expo start
Supabase Tables
```

The app currently uses:

alliances
alliance_users
members
daily_member_stats
train_assignments
alliance_events

## Development Notes

Daily member totals are not stored directly on the members table. Weekly and monthly VS scores/donations are calculated from daily_member_stats.

This keeps member profile data separate from time-series performance data.
