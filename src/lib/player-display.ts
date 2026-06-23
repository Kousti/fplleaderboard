import type { Player } from "@/lib/teams";

export function playerDisplayName(player: Pick<Player, "displayName" | "gameName">): string {
  const name = player.displayName?.trim();
  return name || player.gameName;
}

export function formatRiotId(gameName: string, tagLine: string): string {
  return `${gameName}#${tagLine}`;
}
