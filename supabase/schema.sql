-- Run this in Supabase SQL Editor (free tier works fine)

create table if not exists snapshots (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now()
);

create table if not exists team_results (
  id uuid primary key default gen_random_uuid(),
  snapshot_id uuid not null references snapshots(id) on delete cascade,
  team_id text not null,
  team_name text not null,
  total_score integer not null,
  average_score integer not null,
  position integer not null
);

create table if not exists player_results (
  id uuid primary key default gen_random_uuid(),
  snapshot_id uuid not null references snapshots(id) on delete cascade,
  team_id text not null,
  game_name text not null,
  tag_line text not null,
  display_name text,
  role text check (role is null or role in ('Top', 'Jungle', 'Mid', 'ADC', 'Support')),
  is_active boolean not null default true,
  tier text,
  rank text,
  league_points integer,
  wins integer,
  losses integer,
  score integer not null default 0,
  error text,
  profile_icon_id integer
);

create index if not exists team_results_snapshot_id_idx on team_results(snapshot_id);
create index if not exists team_results_team_id_idx on team_results(team_id);
create index if not exists player_results_snapshot_id_idx on player_results(snapshot_id);
create index if not exists snapshots_created_at_idx on snapshots(created_at desc);

alter table snapshots enable row level security;
alter table team_results enable row level security;
alter table player_results enable row level security;

-- Public read access for the leaderboard app (writes use service role key server-side)
create policy "Public read snapshots"
  on snapshots for select
  using (true);

create policy "Public read team_results"
  on team_results for select
  using (true);

create policy "Public read player_results"
  on player_results for select
  using (true);
