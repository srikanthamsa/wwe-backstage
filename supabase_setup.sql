-- WWE Backstage v2 — Run in Supabase SQL Editor
-- These are NEW tables (bs2_*) so they won't conflict with v1

drop table if exists bs2_storylines;
drop table if exists bs2_trades;
drop table if exists bs2_matches;
drop table if exists bs2_state;

create table bs2_state (
  id integer primary key default 1,
  rosters jsonb default '{}',
  championships jsonb default '{}',
  factions jsonb default '[]',
  feed jsonb default '[]',
  initialized boolean default false,
  updated_at timestamptz default now()
);

insert into bs2_state (id) values (1) on conflict (id) do nothing;

create table bs2_trades (
  id uuid primary key default gen_random_uuid(),
  from_gm text not null,
  to_gm text not null,
  offer jsonb not null,
  status text default 'pending',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table bs2_matches (
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

create table bs2_storylines (
  id uuid primary key default gen_random_uuid(),
  title text,
  gm1 text,
  gm2 text,
  status text default 'active',
  events jsonb default '[]',
  created_at timestamptz default now()
);

alter publication supabase_realtime add table bs2_state;
alter publication supabase_realtime add table bs2_trades;
alter publication supabase_realtime add table bs2_matches;
alter publication supabase_realtime add table bs2_storylines;

alter table bs2_state enable row level security;
alter table bs2_trades enable row level security;
alter table bs2_matches enable row level security;
alter table bs2_storylines enable row level security;

create policy "Allow all bs2_state" on bs2_state for all using (true) with check (true);
create policy "Allow all bs2_trades" on bs2_trades for all using (true) with check (true);
create policy "Allow all bs2_matches" on bs2_matches for all using (true) with check (true);
create policy "Allow all bs2_storylines" on bs2_storylines for all using (true) with check (true);
