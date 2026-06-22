import type { LeaderboardPlayer, LeaderboardTeam } from "@/components/Leaderboard";

export interface IndividualPlayerEntry extends LeaderboardPlayer {
  position: number;
  teamId: string;
  teamName: string;
  teamFullName: string;
  teamLogoUrl: string;
}

export function buildIndividualLeaderboard(
  teams: LeaderboardTeam[],
  teamId: string | null = null
): IndividualPlayerEntry[] {
  const filteredTeams = teamId
    ? teams.filter((team) => team.teamId === teamId)
    : teams;

  const players = filteredTeams.flatMap((team) =>
    team.players.map((player) => ({
      ...player,
      teamId: team.teamId,
      teamName: team.teamName,
      teamFullName: team.fullName,
      teamLogoUrl: team.logoUrl,
      position: 0,
    }))
  );

  return players
    .sort((a, b) => b.score - a.score)
    .map((player, index) => ({
      ...player,
      position: index + 1,
    }));
}
