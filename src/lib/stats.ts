export function winrate(wins: number, losses: number): number {
  const total = wins + losses;
  if (!total) {
    return 0;
  }

  return Math.round((wins / total) * 100);
}

export function averageWinrate(
  players: { wins: number | null; losses: number | null }[]
): number {
  const rates = players
    .map((player) => winrate(player.wins ?? 0, player.losses ?? 0))
    .filter((rate) => rate > 0 || players.some((p) => (p.wins ?? 0) + (p.losses ?? 0) > 0));

  if (!rates.length) {
    return 0;
  }

  return Math.round(rates.reduce((sum, rate) => sum + rate, 0) / rates.length);
}
