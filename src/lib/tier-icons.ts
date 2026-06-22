import type { Tier } from "./rank";

const TIER_ICON_BASE = "https://opgg-static.akamaized.net/images/medals_new";

const VALID_TIERS = new Set<string>([
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
]);

export function getTierIconUrl(tier: string | null): string | null {
  if (!tier) {
    return null;
  }

  const normalized = tier.toUpperCase();
  if (!VALID_TIERS.has(normalized)) {
    return null;
  }

  return `${TIER_ICON_BASE}/${normalized.toLowerCase()}.png`;
}

export function getTierLabel(tier: string | null): Tier | "UNRANKED" {
  if (!tier) {
    return "UNRANKED";
  }

  const normalized = tier.toUpperCase() as Tier;
  return VALID_TIERS.has(normalized) ? normalized : "UNRANKED";
}
