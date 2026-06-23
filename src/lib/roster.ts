import { getSupabase } from "@/lib/db";
import { playerDisplayName } from "@/lib/player-display";
import { TEAM_ROSTER_LIMIT } from "@/lib/rank";
import { normalizeRole, type PlayerRole } from "@/lib/roles";
import { getSchemaMigrationHint, isMissingRosterTable, throwSchemaError } from "@/lib/schema-errors";import {
  getTeamById,
  withResolvedActiveFlags,
  type Player,
  TEAMS,
} from "@/lib/teams";

interface TeamRosterRow {
  team_id: string;
  game_name: string;
  tag_line: string;
  display_name: string | null;
  role: string | null;
  is_active: boolean;
}

export interface AdminTeamRoster {
  teamId: string;
  teamName: string;
  fullName: string;
  players: Player[];
}

function playerKey(player: Pick<Player, "gameName" | "tagLine">): string {  return `${player.gameName}#${player.tagLine}`;
}

function toPlayer(row: TeamRosterRow): Player {
  return {
    gameName: row.game_name,
    tagLine: row.tag_line,
    displayName: row.display_name ?? row.game_name,
    role: normalizeRole(row.role),
    isActive: row.is_active,
  };
}

function rosterInsertRow(teamId: string, player: Player) {
  return {
    team_id: teamId,
    game_name: player.gameName,
    tag_line: player.tagLine,
    display_name: playerDisplayName(player),
    role: player.role ?? null,
    is_active: player.isActive ?? true,
  };
}

export async function getTeamRosterFromDb(teamId: string): Promise<Player[]> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("team_roster")
    .select("team_id, game_name, tag_line, display_name, role, is_active")
    .eq("team_id", teamId)
    .order("created_at", { ascending: true });

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
  return (data ?? []).map((row) => toPlayer(row as TeamRosterRow));
}

export async function getResolvedTeamPlayers(teamId: string): Promise<Player[]> {
  const dbRoster = await getTeamRosterFromDb(teamId);
  if (dbRoster.length > 0) {
    return dbRoster;
  }

  const team = getTeamById(teamId);
  return team ? withResolvedActiveFlags(team.players) : [];
}

export async function countActivePlayers(teamId: string): Promise<number> {
  const players = await getResolvedTeamPlayers(teamId);
  return players.filter((player) => player.isActive).length;
}

export async function ensureTeamRosterInitialized(teamId: string): Promise<void> {
  const existing = await getTeamRosterFromDb(teamId);
  if (existing.length > 0) {
    return;
  }

  const team = getTeamById(teamId);
  if (!team) {
    throw new Error("Unknown team");
  }

  const supabase = getSupabase();
  const players = withResolvedActiveFlags(team.players);
  const rows = players.map((player) => rosterInsertRow(teamId, player));

  const { error } = await supabase.from("team_roster").insert(rows);
  if (error) {
    throwSchemaError(error.message);
  }}

export async function addPlayerToRoster(teamId: string, player: Player): Promise<void> {
  const activeCount = await countActivePlayers(teamId);
  const rosterPlayer: Player = {
    ...player,
    isActive: player.isActive ?? activeCount < TEAM_ROSTER_LIMIT,
  };

  const supabase = getSupabase();

  const { error } = await supabase.from("team_roster").insert(rosterInsertRow(teamId, rosterPlayer));

  if (error) {
    const hint = getSchemaMigrationHint(error.message);
    if (hint) {
      throw new Error(hint);
    }
    if (error.code === "23505") {
      throw new Error("Player is already on this team's roster");
    }
    throw new Error(error.message);
  }
}

export async function replacePlayerOnRoster(
  teamId: string,
  oldPlayer: Player,
  newPlayer: Player
): Promise<void> {
  const supabase = getSupabase();

  const { data: oldRow, error: fetchError } = await supabase
    .from("team_roster")
    .select("is_active")
    .eq("team_id", teamId)
    .eq("game_name", oldPlayer.gameName)
    .eq("tag_line", oldPlayer.tagLine)
    .maybeSingle();

  if (fetchError) {
    throwSchemaError(fetchError.message);
  }

  const { data: removed, error: removeError } = await supabase
    .from("team_roster")
    .delete()
    .eq("team_id", teamId)
    .eq("game_name", oldPlayer.gameName)
    .eq("tag_line", oldPlayer.tagLine)
    .select("id");

  if (removeError) {
    throw new Error(removeError.message);
  }

  if (!removed?.length) {
    throw new Error("Player to replace was not found on the roster");
  }

  const replacement: Player = {
    ...newPlayer,
    isActive: newPlayer.isActive ?? oldRow?.is_active ?? false,
  };

  const { error: insertError } = await supabase
    .from("team_roster")
    .insert(rosterInsertRow(teamId, replacement));

  if (insertError) {
    if (insertError.code === "23505") {
      throw new Error("Replacement player is already on this team's roster");
    }
    throw new Error(insertError.message);
  }
}

export async function updatePlayerRoleOnRoster(
  teamId: string,
  player: Pick<Player, "gameName" | "tagLine">,
  role: PlayerRole | null
): Promise<void> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("team_roster")
    .update({ role })
    .eq("team_id", teamId)
    .eq("game_name", player.gameName)
    .eq("tag_line", player.tagLine)
    .select("id");

  if (error) {
    throwSchemaError(error.message);
  }
  if (!data?.length) {
    throw new Error("Player was not found on the roster");
  }
}

export async function setActiveRoster(
  teamId: string,
  activePlayers: Pick<Player, "gameName" | "tagLine">[]
): Promise<void> {
  if (activePlayers.length !== TEAM_ROSTER_LIMIT) {
    throw new Error(`Active roster must have exactly ${TEAM_ROSTER_LIMIT} players`);
  }

  await ensureTeamRosterInitialized(teamId);

  const roster = await getTeamRosterFromDb(teamId);
  const rosterKeys = new Set(roster.map((player) => playerKey(player)));
  const activeKeys = new Set(activePlayers.map((player) => playerKey(player)));

  if (activeKeys.size !== TEAM_ROSTER_LIMIT) {
    throw new Error("Active roster cannot include duplicate players");
  }

  for (const key of activeKeys) {
    if (!rosterKeys.has(key)) {
      throw new Error("Active roster includes a player who is not on the team");
    }
  }

  const supabase = getSupabase();

  const { error: deactivateError } = await supabase
    .from("team_roster")
    .update({ is_active: false })
    .eq("team_id", teamId);

  if (deactivateError) {
    throw new Error(deactivateError.message);
  }

  for (const player of activePlayers) {
    const { error } = await supabase
      .from("team_roster")
      .update({ is_active: true })
      .eq("team_id", teamId)
      .eq("game_name", player.gameName)
      .eq("tag_line", player.tagLine);

    if (error) {
      throw new Error(error.message);
    }
  }
}

export async function getAdminTeamRosters(): Promise<AdminTeamRoster[]> {
  return Promise.all(
    TEAMS.map(async (team) => ({
      teamId: team.id,
      teamName: team.name,
      fullName: team.fullName,
      players: await getResolvedTeamPlayers(team.id),
    }))
  );
}

export async function getAllResolvedPlayers(): Promise<Player[]> {
  const players = await Promise.all(TEAMS.map((team) => getResolvedTeamPlayers(team.id)));
  return players.flat();
}

export type { PlayerRole };
