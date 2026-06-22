const TIER_ORDER = [
  "IRON",
  "BRONZE",
  "SILVER",
  "GOLD",
  "PLATINUM",
  "EMERALD",
  "DIAMOND",
  "MASTER",
  "GRANDMASTER",
  "CHALLENGER",
] as const;

const RANK_ORDER = ["IV", "III", "II", "I"] as const;

export type Tier = (typeof TIER_ORDER)[number];

export const TEAM_ROSTER_LIMIT = 5;

const MASTER_PLUS_INDEX = TIER_ORDER.indexOf("MASTER");

const TIER_SCORE_BASE: Record<Tier, number> = {
  IRON: 0,
  BRONZE: 400,
  SILVER: 800,
  GOLD: 1200,
  PLATINUM: 1600,
  EMERALD: 2000,
  DIAMOND: 2400,
  MASTER: 2800,
  GRANDMASTER: 2800,
  CHALLENGER: 2800,
};

const RANK_OFFSET: Record<(typeof RANK_ORDER)[number], number> = {
  IV: 0,
  III: 100,
  II: 200,
  I: 300,
};

export interface RankedEntry {
  tier: string | null;
  rank: string | null;
  leaguePoints: number;
  wins: number;
  losses: number;
}

function normalizeTier(tier: string): Tier | null {
  const normalized = tier.toUpperCase() as Tier;
  return TIER_ORDER.includes(normalized) ? normalized : null;
}

function normalizeRank(rank: string | null): (typeof RANK_ORDER)[number] {
  const normalized = (rank ?? "IV").toUpperCase() as (typeof RANK_ORDER)[number];
  return RANK_ORDER.includes(normalized) ? normalized : "IV";
}

export function rankToScore(entry: RankedEntry | null): number {
  if (!entry?.tier) {
    return 0;
  }

  const tier = normalizeTier(entry.tier);
  if (!tier) {
    return 0;
  }

  const tierIndex = TIER_ORDER.indexOf(tier);

  if (tierIndex >= MASTER_PLUS_INDEX) {
    return TIER_SCORE_BASE.MASTER + entry.leaguePoints;
  }

  const base = TIER_SCORE_BASE[tier];

  return base + RANK_OFFSET[normalizeRank(entry.rank)] + entry.leaguePoints;
}

export function formatRank(entry: RankedEntry | null): string {
  if (!entry?.tier) {
    return "Unranked";
  }

  const tier = normalizeTier(entry.tier);
  if (!tier) {
    return "Unranked";
  }

  const tierIndex = TIER_ORDER.indexOf(tier);
  if (tierIndex >= 7) {
    return `${capitalize(tier)} ${entry.leaguePoints} LP`;
  }

  return `${capitalize(tier)} ${normalizeRank(entry.rank)} · ${entry.leaguePoints} LP`;
}

export function formatScore(score: number): string {
  if (score <= 0) {
    return "Unranked";
  }

  const masterBase = TIER_SCORE_BASE.MASTER;
  if (score >= masterBase) {
    return `Master ${score - masterBase} LP`;
  }

  for (let index = MASTER_PLUS_INDEX - 1; index >= 0; index -= 1) {
    const tier = TIER_ORDER[index];
    const base = TIER_SCORE_BASE[tier];

    if (score < base) {
      continue;
    }

    const remainder = score - base;
    const rankIndex = Math.min(Math.floor(remainder / 100), 3);
    const lp = remainder % 100;
    return `${capitalize(tier)} ${RANK_ORDER[rankIndex]} · ${lp} LP`;
  }

  return "Unranked";
}

export function formatLp(value: number): string {
  return `${value.toLocaleString("en-US")} LP`;
}

export function formatScoreDelta(change: number): string {
  const prefix = change > 0 ? "+" : "";
  return `${prefix}${change.toLocaleString("en-US")} LP`;
}

export function formatPoints(score: number): string {
  return formatLp(score);
}

export function placementTier(position: number, teamCount: number): Tier {
  if (teamCount <= 1) {
    return "CHALLENGER";
  }

  const maxIndex = TIER_ORDER.length - 1;
  const index = Math.round(((teamCount - position) / (teamCount - 1)) * maxIndex);
  return TIER_ORDER[Math.min(Math.max(index, 0), maxIndex)];
}

function capitalize(value: string): string {
  return value.charAt(0) + value.slice(1).toLowerCase();
}
