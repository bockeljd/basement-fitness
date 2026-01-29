# Basement Fitness

A fast, mobile-first workout tracker you can use mid-workout on iPhone or on a computer.

## MVP features
- Pick a routine
- Track sets (weight + reps)
- Rest timer (big, tappable)
- Workout notes
- Everything stored locally in your browser (no login)

## Deploy to Vercel
This repo is a static site (no build step).

1. In Vercel: **Add New → Project → Import** `bockeljd/basement-fitness`
2. Framework preset: **Other**
3. Build command: **None**
4. Output dir: **.**

Vercel will serve `index.html` from the repo root.

## Data
Stored in `localStorage` under the `bf:*` keys.

## Roadmap
- Shareable routines via JSON export/import
- iCloud/DB sync (Supabase) if needed
- PWA install banner + offline-first
