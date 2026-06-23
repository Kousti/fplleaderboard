import type { DailyPlayerMovers, PlayerDailyChange, PlayerResultRow } from "@/lib/db";
import { normalizeRole } from "@/lib/roles";
import {
  formatHelsinkiDayKey,
  getCurrentHelsinkiDayKey,
  getHelsinkiDayBounds,
  getHelsinkiWeekBounds,
  getHelsinkiWeekStartKey,
  isCompletedHelsinkiDay,
  isCompletedHelsinkiWeek,
} from "@/lib/helsinki-time";

export type MoverPeriod = "daily" | "weekly";

export interface SnapshotRef {
  id: string;
  created_at: string;
}

function playerKey(gameName: string, tagLine: string): string {
  return `${gameName}#${tagLine}`.toLowerCase();
}

function mapPlayerRow(row: PlayerResultRow) {
  return {
    gameName: row.game_name,
    tagLine: row.tag_line,
    displayName: row.display_name ?? row.game_name,
    role: normalizeRole(row.role),
    teamId: row.team_id,
    profileIconId: row.profile_icon_id,
    tier: row.tier,
    rank: row.rank,
    leaguePoints: row.league_points,
    score: row.score,
    error: row.error,
  };
}

function findSnapshotBounds(
  snapshotsAsc: SnapshotRef[],
  startMs: number,
  endMs: number
): { baseline: SnapshotRef | null; closing: SnapshotRef | null } {
  let baseline: SnapshotRef | null = null;
  let closing: SnapshotRef | null = null;

  for (const snapshot of snapshotsAsc) {
    const time = new Date(snapshot.created_at).getTime();

    if (time < startMs) {
      baseline = snapshot;
      continue;
    }

    if (time >= startMs && time <= endMs) {
      closing = snapshot;
    }
  }

  return { baseline, closing };
}

export function findDaySnapshotBounds(
  snapshotsAsc: SnapshotRef[],
  dayKey: string
): { baseline: SnapshotRef | null; closing: SnapshotRef | null } {
  const { start, end } = getHelsinkiDayBounds(dayKey);
  return findSnapshotBounds(snapshotsAsc, start.getTime(), end.getTime());
}

export function findWeekSnapshotBounds(
  snapshotsAsc: SnapshotRef[],
  weekStartKey: string
): { baseline: SnapshotRef | null; closing: SnapshotRef | null } {
  const { start, end } = getHelsinkiWeekBounds(weekStartKey);
  return findSnapshotBounds(snapshotsAsc, start.getTime(), end.getTime());
}

export function listAvailableMoverDays(
  snapshotsAsc: SnapshotRef[],
  now: Date = new Date()
): string[] {
  const todayKey = getCurrentHelsinkiDayKey();
  const dayKeys = new Set<string>();

  for (const snapshot of snapshotsAsc) {
    dayKeys.add(formatHelsinkiDayKey(new Date(snapshot.created_at)));
  }

  return [...dayKeys]
    .filter((dayKey) => dayKey < todayKey && isCompletedHelsinkiDay(dayKey, now))
    .filter((dayKey) => {
      const { baseline, closing } = findDaySnapshotBounds(snapshotsAsc, dayKey);
      return baseline != null && closing != null && baseline.id !== closing.id;
    })
    .sort((a, b) => b.localeCompare(a));
}

export function listAvailableMoverWeeks(
  snapshotsAsc: SnapshotRef[],
  now: Date = new Date()
): string[] {
  const weekStarts = new Set<string>();

  for (const snapshot of snapshotsAsc) {
    weekStarts.add(getHelsinkiWeekStartKey(formatHelsinkiDayKey(new Date(snapshot.created_at))));
  }

  return [...weekStarts]
    .filter((weekStartKey) => isCompletedHelsinkiWeek(weekStartKey, now))
    .filter((weekStartKey) => {
      const { baseline, closing } = findWeekSnapshotBounds(snapshotsAsc, weekStartKey);
      return baseline != null && closing != null && baseline.id !== closing.id;
    })
    .sort((a, b) => b.localeCompare(a));
}

export function resolveMoverDay(
  snapshotsAsc: SnapshotRef[],
  requestedDay: string | null | undefined,
  now: Date = new Date()
): string | null {
  const availableDays = listAvailableMoverDays(snapshotsAsc, now);
  if (!availableDays.length) {
    return null;
  }

  if (requestedDay && availableDays.includes(requestedDay)) {
    return requestedDay;
  }

  return availableDays[0] ?? null;
}

export function resolveMoverWeek(
  snapshotsAsc: SnapshotRef[],
  requestedWeek: string | null | undefined,
  now: Date = new Date()
): string | null {
  const availableWeeks = listAvailableMoverWeeks(snapshotsAsc, now);
  if (!availableWeeks.length) {
    return null;
  }

  const normalizedWeek = requestedWeek ? getHelsinkiWeekStartKey(requestedWeek) : null;

  if (normalizedWeek && availableWeeks.includes(normalizedWeek)) {
    return normalizedWeek;
  }

  return availableWeeks[0] ?? null;
}

export function buildPlayerChanges(
  baselineRows: PlayerResultRow[],
  closingRows: PlayerResultRow[]
): PlayerDailyChange[] {
  const baselineByKey = new Map(
    baselineRows.map((row) => [playerKey(row.game_name, row.tag_line), mapPlayerRow(row)])
  );

  const changes: PlayerDailyChange[] = [];

  for (const row of closingRows) {
    if (row.error) {
      continue;
    }

    const previous = baselineByKey.get(playerKey(row.game_name, row.tag_line));
    if (!previous || previous.error) {
      continue;
    }

    const change = row.score - previous.score;
    if (change === 0) {
      continue;
    }

    changes.push({
      gameName: row.game_name,
      tagLine: row.tag_line,
      displayName: row.display_name ?? row.game_name,
      role: normalizeRole(row.role),
      isActive: row.is_active ?? true,
      teamId: row.team_id,
      profileIconId: row.profile_icon_id,
      tier: row.tier,
      rank: row.rank,
      leaguePoints: row.league_points,
      previousTier: previous.tier,
      previousRank: previous.rank,
      previousLeaguePoints: previous.leaguePoints,
      previousScore: previous.score,
      currentScore: row.score,
      change,
    });
  }

  return changes;
}

export function buildPlayerMovers(
  period: MoverPeriod,
  periodKey: string,
  baseline: SnapshotRef,
  closing: SnapshotRef,
  baselineRows: PlayerResultRow[],
  closingRows: PlayerResultRow[],
  limit = 5
): DailyPlayerMovers {
  const changes = buildPlayerChanges(baselineRows, closingRows);

  return {
    period,
    periodKey,
    baselineAt: baseline.created_at,
    currentAt: closing.created_at,
    gainers: changes
      .filter((entry) => entry.change > 0)
      .sort((a, b) => b.change - a.change)
      .slice(0, limit),
    losers: changes
      .filter((entry) => entry.change < 0)
      .sort((a, b) => a.change - b.change)
      .slice(0, limit),
  };
}

export function buildDailyPlayerMovers(
  dayKey: string,
  baseline: SnapshotRef,
  closing: SnapshotRef,
  baselineRows: PlayerResultRow[],
  closingRows: PlayerResultRow[],
  limit = 5
): DailyPlayerMovers {
  return buildPlayerMovers("daily", dayKey, baseline, closing, baselineRows, closingRows, limit);
}

export function buildWeeklyPlayerMovers(
  weekStartKey: string,
  baseline: SnapshotRef,
  closing: SnapshotRef,
  baselineRows: PlayerResultRow[],
  closingRows: PlayerResultRow[],
  limit = 5
): DailyPlayerMovers {
  return buildPlayerMovers("weekly", weekStartKey, baseline, closing, baselineRows, closingRows, limit);
}
