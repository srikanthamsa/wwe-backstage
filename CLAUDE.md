# WWE Backstage v2 — Claude Code Guide

## What changed from v1
- Font: Syne (modern, wide, premium) replacing Barlow Condensed/Bebas
- No announcement screen — removed completely
- Feed is now the core: every action creates an interactive feed card
- Feed cards have action buttons (cut promo, challenge, fire back, demand rematch, etc.)
- AI promos via Gemini Flash — context-aware, in-character, editable before posting
- Factions: form/break dynamically, pick members, color, name
- HoF: auto-updates from match logs — title reigns, win%, records
- Tag titles: two GMs, two superstars
- Vacating a title has a promo option
- Match log updates W/L records AND title holder
- PWA: installable on iOS/Android

## Env vars
- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY  
- VITE_GEMINI_KEY (get free at aistudio.google.com)

## Tables (bs2_* prefix, separate from v1)
- bs2_state: rosters, championships, factions, feed, initialized
- bs2_trades: trade offers
- bs2_matches: match results
- bs2_storylines: (reserved for future)

## GMs
- srikant (heel, #4a9eff) — The Authority
- ashpak (heel, #2ecc8a) — The Authority
- kvd (face, #f0a500)
- ekansh (face, #e8533a)
- debu (face, #a78bfa)

## Key files
- src/lib/data.js — all constants, rosters, superstar moves data
- src/lib/gemini.js — Gemini Flash API, fallback promos if no key
- src/App.jsx — root, context, bottom nav, realtime subscriptions
- src/components/Feed.jsx — interactive feed cards with action menus
- src/components/Roster.jsx — superstar cards, floating detail modal
- src/components/Titles.jsx — assign/vacate with promo, tag team support
- src/components/Storylines.jsx — feuds/callouts, match log, trades
- src/components/HallOfFame.jsx — auto stats, GM standings, superstar leaderboards
- src/components/FactionManager.jsx — form/break factions (embedded in Factions tab — add to App if needed)
- src/components/PromoModal.jsx — free-floating promo cutter

## To get Gemini API key (free)
1. Go to aistudio.google.com
2. Click "Get API Key"
3. Create a new key, copy it
4. Add to Vercel env vars as VITE_GEMINI_KEY

## The Authority faction
Pre-seeded in INITIAL_ROSTERS but factions are now dynamic — they can form/break in-app.
The app starts with no factions. Srikant should form The Authority on first run.
