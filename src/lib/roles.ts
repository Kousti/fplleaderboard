export const PLAYER_ROLES = ["Top", "Jungle", "Mid", "ADC", "Support"] as const;

export type PlayerRole = (typeof PLAYER_ROLES)[number];

export const ROLE_SHORT_LABEL: Record<PlayerRole, string> = {
  Top: "TOP",
  Jungle: "JGL",
  Mid: "MID",
  ADC: "ADC",
  Support: "SUP",
};

const COMMUNITY_DRAGON_POSITION_BASE =
  "https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-clash/global/default/assets/images/position-selector/positions";

export const ROLE_ICON_URL: Record<PlayerRole, string> = {
  Top: `${COMMUNITY_DRAGON_POSITION_BASE}/icon-position-top.png`,
  Jungle: `${COMMUNITY_DRAGON_POSITION_BASE}/icon-position-jungle.png`,
  Mid: `${COMMUNITY_DRAGON_POSITION_BASE}/icon-position-middle.png`,
  ADC: `${COMMUNITY_DRAGON_POSITION_BASE}/icon-position-bottom.png`,
  Support: `${COMMUNITY_DRAGON_POSITION_BASE}/icon-position-utility.png`,
};

export function roleIconUrl(role: PlayerRole): string {
  return ROLE_ICON_URL[role];
}

export function isPlayerRole(value: string): value is PlayerRole {
  return (PLAYER_ROLES as readonly string[]).includes(value);
}

export function normalizeRole(value: string | null | undefined): PlayerRole | null {
  const trimmed = value?.trim();
  if (!trimmed) {
    return null;
  }

  const match = PLAYER_ROLES.find((role) => role.toLowerCase() === trimmed.toLowerCase());
  return match ?? null;
}
