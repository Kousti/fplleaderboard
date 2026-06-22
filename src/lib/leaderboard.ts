import { type TeamLeaderboardEntry } from "./db";
import { fetchAllPlayerRanks } from "./riot";
import { rankToScore, TEAM_ROSTER_LIMIT } from "./rank";
import { TEAMS, type Team } from "./teams";

export async function buildLeaderboard(): Promise<TeamLeaderboardEntry[]> {
  const allPlayers = TEAMS.flatMap((team) => team.players);
  const rankResults = await fetchAllPlayerRanks(allPlayers);

  const resultsByKey = new Map(
    rankResults.map((result) => [
      `${result.player.gameName}#${result.player.tagLine}`,
      result,
    ])
  );

  const teamEntries = TEAMS.map((team) => buildTeamEntry(team, resultsByKey));
  const sorted = [...teamEntries].sort((a, b) => b.totalScore - a.totalScore);

  return sorted.map((team, index) => ({
    ...team,
    position: index + 1,
  }));
}

function buildTeamEntry(
  team: Team,
  resultsByKey: Map<string, Awaited<ReturnType<typeof fetchAllPlayerRanks>>[number]>
): TeamLeaderboardEntry {
  const players = team.players
    .map((player) => {
      const result = resultsByKey.get(`${player.gameName}#${player.tagLine}`);
      const score = rankToScore(result?.ranked ?? null);

      return {
        gameName: player.gameName,
        tagLine: player.tagLine,
        tier: result?.ranked?.tier ?? null,
        rank: result?.ranked?.rank ?? null,
        leaguePoints: result?.ranked?.leaguePoints ?? null,
        wins: result?.ranked?.wins ?? null,
        losses: result?.ranked?.losses ?? null,
        profileIconId: result?.profileIconId ?? null,
        score,
        error: result?.error ?? null,
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, TEAM_ROSTER_LIMIT);

  const totalScore = players.reduce((sum, player) => sum + player.score, 0);

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
