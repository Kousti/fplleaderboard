-- Run in Supabase SQL Editor if tables already exist without role

alter table team_roster
  add column if not exists role text check (role is null or role in ('Top', 'Jungle', 'Mid', 'ADC', 'Support'));

alter table player_results
  add column if not exists role text check (role is null or role in ('Top', 'Jungle', 'Mid', 'ADC', 'Support'));

alter table player_suggestions
  add column if not exists role text check (role is null or role in ('Top', 'Jungle', 'Mid', 'ADC', 'Support'));
