import type { LeaderboardPlayer, LeaderboardTeam } from "@/components/Leaderboard";
import type { PlayerRole } from "@/lib/roles";

export interface IndividualPlayerEntry extends LeaderboardPlayer {
  position: number;
  teamId: string;
  teamName: string;
  teamFullName: string;
  teamLogoUrl: string;
}

export interface IndividualLeaderboardFilters {
  teamId?: string | null;
  role?: PlayerRole | null;
}

export function buildIndividualLeaderboard(
  teams: LeaderboardTeam[],
  filters: IndividualLeaderboardFilters = {}
): IndividualPlayerEntry[] {
  const teamId = filters.teamId ?? null;
  const role = filters.role ?? null;

  const filteredTeams = teamId
    ? teams.filter((team) => team.teamId === teamId)
    : teams;

  const players = filteredTeams.flatMap((team) =>
    team.players
      .filter((player) => !role || player.role === role)
      .map((player) => ({
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
