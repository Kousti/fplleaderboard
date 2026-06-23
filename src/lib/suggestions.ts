import { getSupabase } from "@/lib/db";
import {
  addPlayerToRoster,
  ensureTeamRosterInitialized,
  replacePlayerOnRoster,
  removePlayerFromRoster,
  setActiveRoster,
  updatePlayerRoleOnRoster,
} from "@/lib/roster";
import { fetchPlayerRank } from "@/lib/riot";
import { playerDisplayName } from "@/lib/player-display";
import { TEAM_ROSTER_LIMIT } from "@/lib/rank";
import { normalizeRole, type PlayerRole } from "@/lib/roles";
import { getResolvedTeamPlayers } from "@/lib/roster";
import { getTeamById, TEAMS, type Player } from "@/lib/teams";
import { getSchemaMigrationHint, isMissingRosterTable } from "@/lib/schema-errors";

export type SuggestionType = "add" | "replace" | "change_role" | "set_active_roster" | "remove";
export type SuggestionStatus = "pending" | "approved" | "rejected";

export interface ActiveRosterPlayer {
  gameName: string;
  tagLine: string;
}

export interface PlayerSuggestion {
  id: string;
  createdAt: string;
  teamId: string;
  gameName: string;
  tagLine: string;
  displayName: string;
  role: PlayerRole | null;
  suggestionType: SuggestionType;
  replacesGameName: string | null;
  replacesTagLine: string | null;
  activeRoster: ActiveRosterPlayer[] | null;
  submitterNote: string | null;
  status: SuggestionStatus;
  reviewedAt: string | null;
  adminNote: string | null;
  previewTier: string | null;
  previewRank: string | null;
  previewLeaguePoints: number | null;
  profileIconId: number | null;
}

interface SuggestionRow {
  id: string;
  created_at: string;
  team_id: string;
  game_name: string;
  tag_line: string;
  display_name: string | null;
  role: string | null;
  suggestion_type: SuggestionType;
  replaces_game_name: string | null;
  replaces_tag_line: string | null;
  active_roster: unknown;
  submitter_note: string | null;
  status: SuggestionStatus;
  reviewed_at: string | null;
  admin_note: string | null;
  preview_tier: string | null;
  preview_rank: string | null;
  preview_league_points: number | null;
  profile_icon_id: number | null;
}

function playerKey(player: Pick<Player, "gameName" | "tagLine">): string {
  return `${player.gameName}#${player.tagLine}`;
}

function parseActiveRoster(value: unknown): ActiveRosterPlayer[] | null {
  if (!Array.isArray(value)) {
    return null;
  }

  const players = value
    .map((entry) => {
      if (!entry || typeof entry !== "object") {
        return null;
      }

      const record = entry as { gameName?: string; tagLine?: string };
      if (!record.gameName || !record.tagLine) {
        return null;
      }

      return {
        gameName: record.gameName,
        tagLine: record.tagLine,
      };
    })
    .filter((entry): entry is ActiveRosterPlayer => entry !== null);

  return players.length > 0 ? players : null;
}

function mapSuggestion(row: SuggestionRow): PlayerSuggestion {
  return {
    id: row.id,
    createdAt: row.created_at,
    teamId: row.team_id,
    gameName: row.game_name,
    tagLine: row.tag_line,
    displayName: row.display_name ?? row.game_name,
    role: normalizeRole(row.role),
    suggestionType: row.suggestion_type,
    replacesGameName: row.replaces_game_name,
    replacesTagLine: row.replaces_tag_line,
    activeRoster: parseActiveRoster(row.active_roster),
    submitterNote: row.submitter_note,
    status: row.status,
    reviewedAt: row.reviewed_at,
    adminNote: row.admin_note,
    previewTier: row.preview_tier,
    previewRank: row.preview_rank,
    previewLeaguePoints: row.preview_league_points,
    profileIconId: row.profile_icon_id,
  };
}

export async function getTeamOptions() {
  return Promise.all(
    TEAMS.map(async (team) => ({
      id: team.id,
      name: team.name,
      fullName: team.fullName,
      players: await getResolvedTeamPlayers(team.id),
    }))
  );
}

export function isValidTeamId(teamId: string): boolean {
  return TEAMS.some((team) => team.id === teamId);
}

function normalizeText(value: string, maxLength: number): string {
  return value.trim().slice(0, maxLength);
}

function normalizeActivePlayers(players: ActiveRosterPlayer[]): ActiveRosterPlayer[] {
  return players.map((player) => ({
    gameName: normalizeText(player.gameName, 64),
    tagLine: normalizeText(player.tagLine, 16),
  }));
}

export interface CreateSuggestionInput {
  teamId: string;
  gameName?: string;
  tagLine?: string;
  displayName?: string | null;
  role?: string | null;
  suggestionType: SuggestionType;
  replacesGameName?: string | null;
  replacesTagLine?: string | null;
  activePlayers?: ActiveRosterPlayer[] | null;
  submitterNote?: string | null;
  website?: string;
}

async function assertNoDuplicateSuggestion(
  teamId: string,
  suggestionType: SuggestionType,
  gameName?: string,
  tagLine?: string
): Promise<void> {
  const supabase = getSupabase();

  let query = supabase.from("player_suggestions").select("id").eq("status", "pending").eq("team_id", teamId);

  if (suggestionType === "set_active_roster") {
    query = query.eq("suggestion_type", "set_active_roster");
  } else if (gameName && tagLine) {
    query = query.eq("game_name", gameName).eq("tag_line", tagLine);
  }

  const { data: duplicate, error: duplicateError } = await query.maybeSingle();

  if (duplicateError) {
    const hint = getSchemaMigrationHint(duplicateError.message);
    if (hint) {
      throw new Error(hint);
    }
    throw new Error(duplicateError.message);
  }

  if (duplicate) {
    if (suggestionType === "set_active_roster") {
      throw new Error("This team already has an active roster suggestion waiting for review");
    }
    throw new Error("This account is already waiting for review");
  }
}

export async function createSuggestion(input: CreateSuggestionInput): Promise<PlayerSuggestion> {
  if (input.website) {
    throw new Error("Invalid submission");
  }

  const teamId = normalizeText(input.teamId, 64);
  const suggestionType = input.suggestionType;
  const submitterNote = input.submitterNote
    ? normalizeText(input.submitterNote, 500)
    : null;

  if (!isValidTeamId(teamId)) {
    throw new Error("Unknown team");
  }

  if (
    suggestionType !== "add" &&
    suggestionType !== "replace" &&
    suggestionType !== "change_role" &&
    suggestionType !== "set_active_roster" &&
    suggestionType !== "remove"
  ) {
    throw new Error("Invalid suggestion type");
  }

  const supabase = getSupabase();

  if (suggestionType === "set_active_roster") {
    const activePlayers = normalizeActivePlayers(input.activePlayers ?? []);

    if (activePlayers.length !== TEAM_ROSTER_LIMIT) {
      throw new Error(`Active roster must include exactly ${TEAM_ROSTER_LIMIT} players`);
    }

    const activeKeys = new Set(activePlayers.map((player) => playerKey(player)));
    if (activeKeys.size !== TEAM_ROSTER_LIMIT) {
      throw new Error("Active roster cannot include duplicate players");
    }

    const roster = await getResolvedTeamPlayers(teamId);
    const rosterKeys = new Set(roster.map((player) => playerKey(player)));

    for (const player of activePlayers) {
      if (!player.gameName || !player.tagLine) {
        throw new Error("Each active roster player needs a game name and tag line");
      }
      if (!rosterKeys.has(playerKey(player))) {
        throw new Error("Active roster includes a player who is not on the team");
      }
    }

    await assertNoDuplicateSuggestion(teamId, suggestionType);

    const { data, error } = await supabase
      .from("player_suggestions")
      .insert({
        team_id: teamId,
        game_name: activePlayers[0].gameName,
        tag_line: activePlayers[0].tagLine,
        display_name: activePlayers[0].gameName,
        suggestion_type: suggestionType,
        active_roster: activePlayers,
        submitter_note: submitterNote,
      })
      .select("*")
      .single();

    if (error || !data) {
      const hint = error ? getSchemaMigrationHint(error.message) : null;
      if (hint) {
        throw new Error(hint);
      }
      throw new Error(error?.message ?? "Failed to save suggestion");
    }

    return mapSuggestion(data as SuggestionRow);
  }

  const gameName = normalizeText(input.gameName ?? "", 64);
  const tagLine = normalizeText(input.tagLine ?? "", 16);
  const displayName = normalizeText(input.displayName ?? "", 64) || gameName;
  const role = input.role ? normalizeRole(input.role) : null;
  if (input.role?.trim() && !role) {
    throw new Error("Invalid role");
  }
  const replacesGameName = input.replacesGameName
    ? normalizeText(input.replacesGameName, 64)
    : null;
  const replacesTagLine = input.replacesTagLine
    ? normalizeText(input.replacesTagLine, 16)
    : null;

  if (!gameName || !tagLine) {
    throw new Error("Game name and tag line are required");
  }

  if (suggestionType === "replace" && (!replacesGameName || !replacesTagLine)) {
    throw new Error("Replacement requires the current player to replace");
  }

  if (suggestionType === "change_role" && !role) {
    throw new Error("Role is required for a role change");
  }

  const roster = await getResolvedTeamPlayers(teamId);

  if (suggestionType === "change_role" || suggestionType === "remove") {
    const onRoster = roster.find(
      (player) => player.gameName === gameName && player.tagLine === tagLine
    );
    if (!onRoster) {
      throw new Error("Player is not on this team's roster");
    }
  }

  let resolvedDisplayName = displayName;
  let resolvedRole = role;
  if (suggestionType === "change_role" || suggestionType === "remove") {
    const onRoster = roster.find(
      (player) => player.gameName === gameName && player.tagLine === tagLine
    );
    if (onRoster) {
      resolvedDisplayName = playerDisplayName(onRoster);
      if (suggestionType === "remove") {
        resolvedRole = normalizeRole(onRoster.role ?? null);
      }
    }
  }

  if (suggestionType === "remove") {
    await assertNoDuplicateSuggestion(teamId, suggestionType, gameName, tagLine);

    const player: Player = { gameName, tagLine };
    const rankResult = await fetchPlayerRank(player);

    const { data, error } = await supabase
      .from("player_suggestions")
      .insert({
        team_id: teamId,
        game_name: gameName,
        tag_line: tagLine,
        display_name: resolvedDisplayName,
        role: resolvedRole,
        suggestion_type: suggestionType,
        submitter_note: submitterNote,
        preview_tier: rankResult.ranked?.tier ?? null,
        preview_rank: rankResult.ranked?.rank ?? null,
        preview_league_points: rankResult.ranked?.leaguePoints ?? null,
        profile_icon_id: rankResult.profileIconId,
      })
      .select("*")
      .single();

    if (error || !data) {
      const hint = error ? getSchemaMigrationHint(error.message) : null;
      if (hint) {
        throw new Error(hint);
      }
      throw new Error(error?.message ?? "Failed to save suggestion");
    }

    return mapSuggestion(data as SuggestionRow);
  }

  await assertNoDuplicateSuggestion(teamId, suggestionType, gameName, tagLine);

  const player: Player = { gameName, tagLine };
  const rankResult = await fetchPlayerRank(player);

  if (rankResult.error === "Account not found") {
    throw new Error("Riot account not found — check the game name and tag line");
  }

  if (rankResult.error) {
    throw new Error(rankResult.error);
  }

  const { data, error } = await supabase
    .from("player_suggestions")
    .insert({
      team_id: teamId,
      game_name: gameName,
      tag_line: tagLine,
      display_name: resolvedDisplayName,
      role,
      suggestion_type: suggestionType,
      replaces_game_name: suggestionType === "replace" ? replacesGameName : null,
      replaces_tag_line: suggestionType === "replace" ? replacesTagLine : null,
      submitter_note: submitterNote,
      preview_tier: rankResult.ranked?.tier ?? null,
      preview_rank: rankResult.ranked?.rank ?? null,
      preview_league_points: rankResult.ranked?.leaguePoints ?? null,
      profile_icon_id: rankResult.profileIconId,
    })
    .select("*")
    .single();

  if (error || !data) {
    const hint = error ? getSchemaMigrationHint(error.message) : null;
    if (hint) {
      throw new Error(hint);
    }
    throw new Error(error?.message ?? "Failed to save suggestion");
  }

  return mapSuggestion(data as SuggestionRow);
}

export async function listSuggestions(status?: SuggestionStatus): Promise<PlayerSuggestion[]> {
  const supabase = getSupabase();

  let query = supabase
    .from("player_suggestions")
    .select("*")
    .order("created_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error) {
    const hint = getSchemaMigrationHint(error.message);
    if (hint) {
      throw new Error(hint);
    }
    if (isMissingRosterTable(error.message)) {
      return [];
    }
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => mapSuggestion(row as SuggestionRow));
}

export async function reviewSuggestion(
  id: string,
  decision: "approved" | "rejected",
  adminNote?: string | null
): Promise<PlayerSuggestion> {
  const supabase = getSupabase();

  const { data: existing, error: fetchError } = await supabase
    .from("player_suggestions")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (fetchError) {
    throw new Error(fetchError.message);
  }

  if (!existing) {
    throw new Error("Suggestion not found");
  }

  const suggestion = mapSuggestion(existing as SuggestionRow);

  if (suggestion.status !== "pending") {
    throw new Error("Suggestion has already been reviewed");
  }

  if (decision === "approved") {
    const team = getTeamById(suggestion.teamId);
    if (!team) {
      throw new Error("Unknown team");
    }

    await ensureTeamRosterInitialized(suggestion.teamId);

    if (suggestion.suggestionType === "set_active_roster") {
      if (!suggestion.activeRoster || suggestion.activeRoster.length !== TEAM_ROSTER_LIMIT) {
        throw new Error("Active roster data is missing");
      }

      await setActiveRoster(suggestion.teamId, suggestion.activeRoster);
    } else if (suggestion.suggestionType === "add") {
      const newPlayer: Player = {
        gameName: suggestion.gameName,
        tagLine: suggestion.tagLine,
        displayName: suggestion.displayName,
        role: suggestion.role,
      };
      await addPlayerToRoster(suggestion.teamId, newPlayer);
    } else if (suggestion.suggestionType === "replace") {
      if (!suggestion.replacesGameName || !suggestion.replacesTagLine) {
        throw new Error("Replacement target is missing");
      }

      const newPlayer: Player = {
        gameName: suggestion.gameName,
        tagLine: suggestion.tagLine,
        displayName: suggestion.displayName,
        role: suggestion.role,
      };

      if (!newPlayer.role) {
        const roster = await getResolvedTeamPlayers(suggestion.teamId);
        const replaced = roster.find(
          (player) =>
            player.gameName === suggestion.replacesGameName &&
            player.tagLine === suggestion.replacesTagLine
        );
        if (replaced?.role) {
          newPlayer.role = replaced.role;
        }
      }

      await replacePlayerOnRoster(
        suggestion.teamId,
        {
          gameName: suggestion.replacesGameName,
          tagLine: suggestion.replacesTagLine,
        },
        newPlayer
      );
    } else if (suggestion.suggestionType === "change_role") {
      await updatePlayerRoleOnRoster(
        suggestion.teamId,
        {
          gameName: suggestion.gameName,
          tagLine: suggestion.tagLine,
        },
        suggestion.role
      );
    } else if (suggestion.suggestionType === "remove") {
      await removePlayerFromRoster(suggestion.teamId, {
        gameName: suggestion.gameName,
        tagLine: suggestion.tagLine,
      });
    }
  }

  const { data, error } = await supabase
    .from("player_suggestions")
    .update({
      status: decision,
      reviewed_at: new Date().toISOString(),
      admin_note: adminNote ? normalizeText(adminNote, 500) : null,
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to update suggestion");
  }

  return mapSuggestion(data as SuggestionRow);
}
