import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  buildDailyPlayerMovers,
  buildWeeklyPlayerMovers,
  findDaySnapshotBounds,
  findWeekSnapshotBounds,
  listAvailableMoverDays,
  listAvailableMoverWeeks,
  resolveMoverDay,
  resolveMoverWeek,
  type MoverPeriod,
} from "@/lib/daily-movers";

export interface SnapshotRow {
  id: string;
  created_at: string;
}

export interface TeamResultRow {
  id: string;
  snapshot_id: string;
  team_id: string;
  team_name: string;
  total_score: number;
  average_score: number;
  position: number;
}

export interface PlayerResultRow {
  id: string;
  snapshot_id: string;
  team_id: string;
  game_name: string;
  tag_line: string;
  tier: string | null;
  rank: string | null;
  league_points: number | null;
  wins: number | null;
  losses: number | null;
  score: number;
  error: string | null;
  profile_icon_id: number | null;
}

export interface TeamLeaderboardEntry {
  teamId: string;
  teamName: string;
  opggUrl: string;
  position: number;
  totalScore: number;
  averageScore: number;
  players: {
    gameName: string;
    tagLine: string;
    tier: string | null;
    rank: string | null;
    leaguePoints: number | null;
    wins: number | null;
    losses: number | null;
    score: number;
    error: string | null;
    profileIconId: number | null;
  }[];
}

export interface LeaderboardSnapshot {
  id: string;
  createdAt: string;
  teams: TeamLeaderboardEntry[];
}

export interface HistoryPoint {
  snapshotId: string;
  createdAt: string;
  teamId: string;
  teamName: string;
  totalScore: number;
  averageScore: number;
  position: number;
}

export interface PlayerDailyChange {
  gameName: string;
  tagLine: string;
  teamId: string;
  profileIconId: number | null;
  tier: string | null;
  rank: string | null;
  leaguePoints: number | null;
  previousTier: string | null;
  previousRank: string | null;
  previousLeaguePoints: number | null;
  previousScore: number;
  currentScore: number;
  change: number;
}

export interface DailyPlayerMovers {
  period: "daily" | "weekly";
  periodKey: string;
  baselineAt: string;
  currentAt: string;
  gainers: PlayerDailyChange[];
  losers: PlayerDailyChange[];
}

export interface DailyMoversPayload {
  period: "daily" | "weekly";
  availableDays: string[];
  availableWeeks: string[];
  selectedDay: string | null;
  selectedWeek: string | null;
  movers: DailyPlayerMovers | null;
}

let supabaseClient: SupabaseClient | null = null;

function getSupabase(): SupabaseClient {
  if (supabaseClient) {
    return supabaseClient;
  }

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be configured");
  }

  supabaseClient = createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return supabaseClient;
}

export async function saveSnapshot(
  teams: TeamLeaderboardEntry[]
): Promise<LeaderboardSnapshot> {
  const supabase = getSupabase();

  const { data: snapshot, error: snapshotError } = await supabase
    .from("snapshots")
    .insert({})
    .select("id, created_at")
    .single();

  if (snapshotError || !snapshot) {
    throw new Error(snapshotError?.message ?? "Failed to create snapshot");
  }

  const teamRows = teams.map((team) => ({
    snapshot_id: snapshot.id,
    team_id: team.teamId,
    team_name: team.teamName,
    total_score: team.totalScore,
    average_score: team.averageScore,
    position: team.position,
  }));

  const { error: teamError } = await supabase.from("team_results").insert(teamRows);
  if (teamError) {
    throw new Error(teamError.message);
  }

  const playerRows = teams.flatMap((team) =>
    team.players.map((player) => ({
      snapshot_id: snapshot.id,
      team_id: team.teamId,
      game_name: player.gameName,
      tag_line: player.tagLine,
      tier: player.tier,
      rank: player.rank,
      league_points: player.leaguePoints,
      wins: player.wins,
      losses: player.losses,
      score: player.score,
      error: player.error,
      profile_icon_id: player.profileIconId,
    }))
  );

  const { error: playerError } = await supabase.from("player_results").insert(playerRows);
  if (playerError) {
    throw new Error(playerError.message);
  }

  return {
    id: snapshot.id,
    createdAt: snapshot.created_at,
    teams,
  };
}

export async function getLatestSnapshot(): Promise<LeaderboardSnapshot | null> {
  const supabase = getSupabase();

  const { data: snapshot, error } = await supabase
    .from("snapshots")
    .select("id, created_at")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!snapshot) {
    return null;
  }

  return getSnapshotById(snapshot.id);
}

async function getSnapshotById(snapshotId: string): Promise<LeaderboardSnapshot | null> {
  const supabase = getSupabase();

  const [{ data: snapshot, error: snapshotError }, { data: teamRows, error: teamError }, { data: playerRows, error: playerError }] =
    await Promise.all([
      supabase.from("snapshots").select("id, created_at").eq("id", snapshotId).maybeSingle(),
      supabase
        .from("team_results")
        .select("*")
        .eq("snapshot_id", snapshotId)
        .order("position", { ascending: true }),
      supabase.from("player_results").select("*").eq("snapshot_id", snapshotId),
    ]);

  if (snapshotError || teamError || playerError) {
    throw new Error(snapshotError?.message ?? teamError?.message ?? playerError?.message);
  }

  if (!snapshot || !teamRows) {
    return null;
  }

  const playersByTeam = new Map<string, PlayerResultRow[]>();
  for (const row of (playerRows ?? []) as PlayerResultRow[]) {
    const existing = playersByTeam.get(row.team_id) ?? [];
    existing.push(row);
    playersByTeam.set(row.team_id, existing);
  }

  return {
    id: snapshot.id,
    createdAt: snapshot.created_at,
    teams: (teamRows as TeamResultRow[]).map((team) => ({
      teamId: team.team_id,
      teamName: team.team_name,
      opggUrl: "",
      position: team.position,
      totalScore: team.total_score,
      averageScore: team.average_score,
      players: (playersByTeam.get(team.team_id) ?? []).map((player) => ({
        gameName: player.game_name,
        tagLine: player.tag_line,
        tier: player.tier,
        rank: player.rank,
        leaguePoints: player.league_points,
        wins: player.wins,
        losses: player.losses,
        score: player.score,
        error: player.error,
        profileIconId: player.profile_icon_id,
      })),
    })),
  };
}

export async function getHistory(limit = 100): Promise<HistoryPoint[]> {
  const supabase = getSupabase();

  const { data: snapshots, error: snapshotError } = await supabase
    .from("snapshots")
    .select("id, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (snapshotError) {
    throw new Error(snapshotError.message);
  }

  if (!snapshots?.length) {
    return [];
  }

  const snapshotIds = snapshots.map((snapshot) => snapshot.id);

  const { data: teamRows, error: teamError } = await supabase
    .from("team_results")
    .select("snapshot_id, team_id, team_name, total_score, average_score, position")
    .in("snapshot_id", snapshotIds);

  if (teamError) {
    throw new Error(teamError.message);
  }

  const createdAtById = new Map(
    snapshots.map((snapshot) => [snapshot.id, snapshot.created_at] as const)
  );

  return (teamRows ?? [])
    .map((row) => ({
      snapshotId: row.snapshot_id,
      createdAt: createdAtById.get(row.snapshot_id) ?? "",
      teamId: row.team_id,
      teamName: row.team_name,
      totalScore: row.total_score,
      averageScore: row.average_score,
      position: row.position,
    }))
    .sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
}

export async function getDailyMoversPayload(
  options: {
    period?: MoverPeriod;
    day?: string | null;
    week?: string | null;
    limit?: number;
  } = {}
): Promise<DailyMoversPayload> {
  const period = options.period ?? "daily";
  const limit = options.limit ?? 5;
  const supabase = getSupabase();

  const { data: snapshots, error: snapshotError } = await supabase
    .from("snapshots")
    .select("id, created_at")
    .order("created_at", { ascending: true });

  if (snapshotError) {
    throw new Error(snapshotError.message);
  }

  const snapshotsAsc = snapshots ?? [];
  const availableDays = listAvailableMoverDays(snapshotsAsc);
  const availableWeeks = listAvailableMoverWeeks(snapshotsAsc);

  if (period === "weekly") {
    const selectedWeek = resolveMoverWeek(snapshotsAsc, options.week);

    if (!selectedWeek) {
      return {
        period,
        availableDays,
        availableWeeks,
        selectedDay: null,
        selectedWeek: null,
        movers: null,
      };
    }

    const { baseline, closing } = findWeekSnapshotBounds(snapshotsAsc, selectedWeek);
    if (!baseline || !closing) {
      return {
        period,
        availableDays,
        availableWeeks,
        selectedDay: null,
        selectedWeek,
        movers: null,
      };
    }

    const [{ data: baselineRows, error: baselineError }, { data: closingRows, error: closingError }] =
      await Promise.all([
        supabase.from("player_results").select("*").eq("snapshot_id", baseline.id),
        supabase.from("player_results").select("*").eq("snapshot_id", closing.id),
      ]);

    if (baselineError || closingError) {
      throw new Error(baselineError?.message ?? closingError?.message);
    }

    return {
      period,
      availableDays,
      availableWeeks,
      selectedDay: null,
      selectedWeek,
      movers: buildWeeklyPlayerMovers(
        selectedWeek,
        baseline,
        closing,
        (baselineRows ?? []) as PlayerResultRow[],
        (closingRows ?? []) as PlayerResultRow[],
        limit
      ),
    };
  }

  const selectedDay = resolveMoverDay(snapshotsAsc, options.day);

  if (!selectedDay) {
    return {
      period,
      availableDays,
      availableWeeks,
      selectedDay: null,
      selectedWeek: null,
      movers: null,
    };
  }

  const { baseline, closing } = findDaySnapshotBounds(snapshotsAsc, selectedDay);
  if (!baseline || !closing) {
    return {
      period,
      availableDays,
      availableWeeks,
      selectedDay,
      selectedWeek: null,
      movers: null,
    };
  }

  const [{ data: baselineRows, error: baselineError }, { data: closingRows, error: closingError }] =
    await Promise.all([
      supabase.from("player_results").select("*").eq("snapshot_id", baseline.id),
      supabase.from("player_results").select("*").eq("snapshot_id", closing.id),
    ]);

  if (baselineError || closingError) {
    throw new Error(baselineError?.message ?? closingError?.message);
  }

  return {
    period,
    availableDays,
    availableWeeks,
    selectedDay,
    selectedWeek: null,
    movers: buildDailyPlayerMovers(
      selectedDay,
      baseline,
      closing,
      (baselineRows ?? []) as PlayerResultRow[],
      (closingRows ?? []) as PlayerResultRow[],
      limit
    ),
  };
}

export async function getDailyPlayerMovers(
  limit = 5,
  requestedDay?: string | null
): Promise<DailyPlayerMovers | null> {
  const payload = await getDailyMoversPayload({ period: "daily", day: requestedDay, limit });
  return payload.movers;
}
