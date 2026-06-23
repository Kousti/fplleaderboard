-- Run in Supabase SQL Editor after schema.sql

create table if not exists player_suggestions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  team_id text not null,
  game_name text not null,
  tag_line text not null,
  display_name text,
  role text check (role is null or role in ('Top', 'Jungle', 'Mid', 'ADC', 'Support')),
  suggestion_type text not null check (suggestion_type in ('add', 'replace', 'change_role', 'set_active_roster')),
  replaces_game_name text,
  replaces_tag_line text,
  active_roster jsonb,
  submitter_note text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  reviewed_at timestamptz,
  admin_note text,
  preview_tier text,
  preview_rank text,
  preview_league_points integer,
  profile_icon_id integer
);

create table if not exists team_roster (
  id uuid primary key default gen_random_uuid(),
  team_id text not null,
  game_name text not null,
  tag_line text not null,
  display_name text,
  role text check (role is null or role in ('Top', 'Jungle', 'Mid', 'ADC', 'Support')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (team_id, game_name, tag_line)
);

create index if not exists player_suggestions_status_idx on player_suggestions(status);
create index if not exists player_suggestions_created_at_idx on player_suggestions(created_at desc);
create index if not exists team_roster_team_id_idx on team_roster(team_id);

alter table player_suggestions enable row level security;
alter table team_roster enable row level security;

-- All reads/writes go through the service role key server-side.
