function isMissingRelation(message: string): boolean {
  const lower = message.toLowerCase();

  if (lower.includes("column")) {
    return false;
  }

  return (
    lower.includes("schema cache") ||
    /relation "[^"]+" does not exist/i.test(message)
  );
}

export function getSchemaMigrationHint(message: string): string | null {
  const lower = message.toLowerCase();

  if (lower.includes("is_active")) {
    return "Run supabase/add_is_active.sql in your Supabase SQL Editor.";
  }

  if (lower.includes("active_roster")) {
    return "Run supabase/add_set_active_roster_suggestion.sql in your Supabase SQL Editor.";
  }

  if (lower.includes("display_name")) {
    return "Run supabase/add_display_name.sql in your Supabase SQL Editor.";
  }

  if (lower.includes("profile_icon_id")) {
    return "Run supabase/add_profile_icon_id.sql in your Supabase SQL Editor.";
  }

  if (lower.includes("set_active_roster") || (lower.includes("suggestion_type") && lower.includes("check"))) {
    return "Run supabase/add_set_active_roster_suggestion.sql and supabase/add_change_role_suggestion.sql in your Supabase SQL Editor.";
  }

  if (isMissingRelation(message)) {
    if (lower.includes("player_suggestions") || lower.includes("team_roster")) {
      return "Run supabase/player_suggestions.sql in your Supabase SQL Editor first.";
    }

    return "Run supabase/schema.sql in your Supabase SQL Editor first.";
  }

  return null;
}

export function throwSchemaError(message: string): never {
  throw new Error(getSchemaMigrationHint(message) ?? message);
}

export function isMissingRosterTable(message: string): boolean {
  return isMissingRelation(message);
}
