-- Run in Supabase SQL Editor if tables already exist without display_name

alter table team_roster
  add column if not exists display_name text;

alter table player_results
  add column if not exists display_name text;

alter table player_suggestions
  add column if not exists display_name text;

update team_roster
set display_name = game_name
where display_name is null;

update player_results
set display_name = game_name
where display_name is null;
