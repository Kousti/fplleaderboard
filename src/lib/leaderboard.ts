import { type TeamLeaderboardEntry } from "./db";
import { playerDisplayName } from "./player-display";
import { normalizeRole } from "./roles";
import { fetchAllPlayerRanks } from "./riot";
import { rankToScore } from "./rank";
import { getResolvedTeamPlayers } from "./roster";
import { TEAMS, type Team } from "./teams";

export async function buildLeaderboard(): Promise<TeamLeaderboardEntry[]> {
  const teamsWithPlayers = await Promise.all(
    TEAMS.map(async (team) => ({
      team,
      players: await getResolvedTeamPlayers(team.id),
    }))
  );

  const allPlayers = teamsWithPlayers.flatMap(({ players }) => players);
  const rankResults = await fetchAllPlayerRanks(allPlayers);

  const resultsByKey = new Map(
    rankResults.map((result) => [
      `${result.player.gameName}#${result.player.tagLine}`,
      result,
    ])
  );

  const teamEntries = teamsWithPlayers.map(({ team, players }) =>
    buildTeamEntry(team, players, resultsByKey)
  );
  const sorted = [...teamEntries].sort((a, b) => b.totalScore - a.totalScore);

  return sorted.map((team, index) => ({
    ...team,
    position: index + 1,
  }));
}

function buildTeamEntry(
  team: Team,
  rosterPlayers: Awaited<ReturnType<typeof getResolvedTeamPlayers>>,
  resultsByKey: Map<string, Awaited<ReturnType<typeof fetchAllPlayerRanks>>[number]>
): TeamLeaderboardEntry {
  const players = rosterPlayers.map((player) => {
    const result = resultsByKey.get(`${player.gameName}#${player.tagLine}`);
    const score = rankToScore(result?.ranked ?? null);

    return {
      gameName: player.gameName,
      tagLine: player.tagLine,
      displayName: playerDisplayName(player),
      role: normalizeRole(player.role ?? null),
      isActive: player.isActive ?? false,
      tier: result?.ranked?.tier ?? null,
      rank: result?.ranked?.rank ?? null,
      leaguePoints: result?.ranked?.leaguePoints ?? null,
      wins: result?.ranked?.wins ?? null,
      losses: result?.ranked?.losses ?? null,
      profileIconId: result?.profileIconId ?? null,
      score,
      error: result?.error ?? null,
    };
  });

  const totalScore = players
    .filter((player) => player.isActive)
    .reduce((sum, player) => sum + player.score, 0);

  return {
    teamId: team.id,
    teamName: team.name,
    opggUrl: team.opggUrl,
    position: 0,
    totalScore,
    averageScore: 0,
    players,
  };
}
