-- Run in Supabase SQL Editor

alter table team_roster
  add column if not exists is_active boolean not null default true;

alter table player_results
  add column if not exists is_active boolean not null default true;
