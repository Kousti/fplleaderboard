-- Run in Supabase SQL Editor if player_results already exists without profile_icon_id
alter table player_results
  add column if not exists profile_icon_id integer;
