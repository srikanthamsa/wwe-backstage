# WWE Backstage — Claude Code Guide

## What this is
A WWE Universe Mode manager for 5 GMs (Srikant, Ashpak, KVD, Ekansh, Debu). Real-time web app built with React + Vite + Supabase. Deployed on Vercel.

## Universe context
- **The Authority** (heel faction): Srikant + Ashpak — always have each other's backs
- **Faces**: KVD, Ekansh, Debu — against The Authority
- **Srikant** is the commissioner — has admin privileges

## Tech stack
- React 18 + Vite 5
- Supabase (3 tables: backstage_state, backstage_trades, backstage_matches)
- Hosted on Vercel

## Project structure
```
src/
  App.jsx                  # Root, nav, auth, realtime subscriptions
  main.jsx
  lib/
    data.js               # All constants: GMS, CHAMPIONSHIPS, FACTIONS, INITIAL_ROSTERS, helpers
  components/
    Login.jsx             # GM selection screen
    UI.jsx                # Shared primitives: Card, OvrBadge, ActionBtn, etc.
    Dashboard.jsx         # Activity feed, title snapshot, recent matches
    Roster.jsx            # View any GM's roster, W/L records
    Trades.jsx            # Send/accept/reject trade offers
    Matches.jsx           # Log match results, auto-updates W/L and titles
    Championships.jsx     # Assign/vacate WWE, World HW, IC, US, Tag titles
    Factions.jsx          # The Authority faction display + GM standings
    Announcements.jsx     # Generate WhatsApp text + downloadable HTML card
supabase_setup.sql         # Run in Supabase SQL editor
```

## Supabase tables
### backstage_state (id=1)
- rosters: { gmId: [{name, ovr, wins, losses, on_loan, loan_to, loan_matches}] }
- championships: { champId: {gm, superstar, won_at} }
- factions: [{id, name, members[], color}]
- activity_feed: [{id, type, text, ts}]
- initialized: boolean

### backstage_trades
- from_gm, to_gm, offer: {giving[], receiving[], notes}, status: pending/accepted/rejected

### backstage_matches
- gm1, gm2, superstar1, superstar2, winner_gm, winner_superstar, match_type, title_on_line, notes

## Championships
- wwe: WWE Championship
- world: World Heavyweight Championship
- ic: Intercontinental Championship
- us: United States Championship
- tag: Tag Team Championships

## GMs
- srikant → Srikant Freakin' Hamsa (#378ADD) — commissioner, The Authority
- ashpak → Ashpak "KVD's Nightmare" (#1D9E75) — The Authority
- kvd → KVD "The Best In The World" (#BA7517)
- ekansh → Ekansh "The Beast" Tiwari (#D85A30)
- debu → Debu "The Tribal Chief" (#7F77DD)

## Common tasks

### Add a new superstar to a GM's roster
Edit INITIAL_ROSTERS in src/lib/data.js, then re-initialize from the app (admin only).
Or update Supabase directly via SQL.

### Add a new championship
Add to CHAMPIONSHIPS array in src/lib/data.js.

### Add a new faction
Add to FACTIONS array in src/lib/data.js.

### Change a GM's nickname
Update in GMS array in src/lib/data.js AND run SQL to update sold_log winner names if needed.

### Reset everything
Run supabase_setup.sql again (drops and recreates tables), then click "Initialize Universe" in the app.
