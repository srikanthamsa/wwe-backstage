-- Run this entire block in Supabase SQL Editor

drop table if exists backstage_trades;
drop table if exists backstage_matches;
drop table if exists backstage_state;

-- Main state table: rosters, titles, factions, activity feed
create table backstage_state (
  id integer primary key default 1,
  rosters jsonb default '{}',
  championships jsonb default '{}',
  factions jsonb default '[]',
  contract_signings jsonb default '[]',
  activity_feed jsonb default '[]',
  initialized boolean default false,
  updated_at timestamptz default now()
);

insert into backstage_state (id) values (1) on conflict (id) do nothing;

-- Trades table
create table backstage_trades (
  id uuid primary key default gen_random_uuid(),
  from_gm text not null,
  to_gm text not null,
  offer jsonb not null,
  status text default 'pending',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Match results
create table backstage_matches (
  id uuid primary key default gen_random_uuid(),
  gm1 text not null,
  gm2 text not null,
  superstar1 text not null,
  superstar2 text not null,
  winner_gm text not null,
  winner_superstar text not null,
  match_type text default 'Singles',
  title_on_line text,
  notes text,
  played_at timestamptz default now()
);

-- Enable realtime
alter publication supabase_realtime add table backstage_state;
alter publication supabase_realtime add table backstage_trades;
alter publication supabase_realtime add table backstage_matches;

-- RLS
alter table backstage_state enable row level security;
alter table backstage_trades enable row level security;
alter table backstage_matches enable row level security;

create policy "Allow all state" on backstage_state for all using (true) with check (true);
create policy "Allow all trades" on backstage_trades for all using (true) with check (true);
create policy "Allow all matches" on backstage_matches for all using (true) with check (true);
