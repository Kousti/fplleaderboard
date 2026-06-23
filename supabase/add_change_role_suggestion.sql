-- Run in Supabase SQL Editor to allow role-change suggestions

alter table player_suggestions
  drop constraint if exists player_suggestions_suggestion_type_check;

alter table player_suggestions
  add constraint player_suggestions_suggestion_type_check
  check (suggestion_type in ('add', 'replace', 'change_role'));
