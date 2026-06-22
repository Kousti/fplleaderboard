import type { LeaderboardSnapshot } from "@/lib/db";
import { teamLogoUrl } from "@/lib/logos";
import { TEAMS } from "@/lib/teams";

export interface TeamMeta {
  teamName: string;
  opggUrl: string;
  logoUrl: string;
  fullName: string;
}

export function buildTeamMetaById(): Map<string, TeamMeta> {
  return new Map(
    TEAMS.map((team) => [
      team.id,
      {
        teamName: team.name,
        opggUrl: team.opggUrl,
        logoUrl: teamLogoUrl(team.logoImageId),
        fullName: team.fullName,
      },
    ])
  );
}

export function buildLeaderboardTeams(
  snapshot: LeaderboardSnapshot | null,
  teamMetaById: Map<string, TeamMeta>
) {
  return (
    snapshot?.teams.map((team) => {
      const meta = teamMetaById.get(team.teamId);
      return {
        ...team,
        opggUrl: meta?.opggUrl ?? "",
        logoUrl: meta?.logoUrl ?? "",
        fullName: meta?.fullName ?? team.teamName,
      };
    }) ?? []
  );
}
