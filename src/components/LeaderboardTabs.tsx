"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { buildIndividualLeaderboard } from "@/lib/leaderboard-data";
import { placementTier } from "@/lib/rank";
import { type LeaderboardTeam } from "@/components/Leaderboard";
import { OpggRankCell } from "@/components/OpggRankCell";
import { ProfileIcon } from "@/components/ProfileIcon";
import { WinratePills } from "@/components/WinratePills";

type Tab = "teams" | "players";

interface LeaderboardTabsProps {
  teams: LeaderboardTeam[];
}

export function LeaderboardTabs({ teams }: LeaderboardTabsProps) {
  const [tab, setTab] = useState<Tab>("teams");
  const [expandedTeamId, setExpandedTeamId] = useState<string | null>(null);
  const [playerTeamFilter, setPlayerTeamFilter] = useState<string>("all");

  const players = useMemo(
    () =>
      buildIndividualLeaderboard(
        teams,
        playerTeamFilter === "all" ? null : playerTeamFilter
      ),
    [teams, playerTeamFilter]
  );
  const showTeamOnPlayer = playerTeamFilter === "all";

  if (!teams.length) {
    return (
      <div className="empty-state">
        No leaderboard data yet. Run the update job once to fetch LP from Riot.
      </div>
    );
  }

  return (
    <div className="opgg-board">
      <div className="opgg-toolbar">
        <div className="opgg-tabs">
          <button
            type="button"
            className={`opgg-tab${tab === "teams" ? " opgg-tab--active" : ""}`}
            onClick={() => setTab("teams")}
          >
            Teams
          </button>
          <button
            type="button"
            className={`opgg-tab${tab === "players" ? " opgg-tab--active" : ""}`}
            onClick={() => setTab("players")}
          >
            Individual
          </button>
        </div>
        <div className="opgg-toolbar-actions">
          {tab === "players" ? (
            <label className="opgg-team-filter">
              <span className="opgg-team-filter-label">Team</span>
              <select
                className="opgg-team-filter-select"
                value={playerTeamFilter}
                onChange={(event) => setPlayerTeamFilter(event.target.value)}
              >
                <option value="all">All players</option>
                {teams.map((team) => (
                  <option key={team.teamId} value={team.teamId}>
                    {team.fullName}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          <span className="opgg-mode-badge">Solo / Duo</span>
        </div>
      </div>

      <div className="opgg-table">
        <div className="opgg-table-head">
          <span>#</span>
          <span>{tab === "teams" ? "Team" : "Player"}</span>
          <span>Rank</span>
          <span>Winrate</span>
        </div>

        {tab === "players"
          ? players.map((player) => (
              <div
                className="opgg-table-row"
                data-rank={player.position}
                key={`${player.gameName}#${player.tagLine}`}
              >
                <span className="opgg-rank-num">{player.position}</span>

                <div className="opgg-entity">
                  <ProfileIcon profileIconId={player.profileIconId} />
                  <div className="opgg-entity-text">
                    <span className="opgg-player-name">
                      {player.gameName}
                      <span className="opgg-player-tag">#{player.tagLine}</span>
                    </span>
                    {showTeamOnPlayer ? (
                      <span className="opgg-team-line">
                        {player.teamLogoUrl ? (
                          <Image
                            className="opgg-team-icon"
                            src={player.teamLogoUrl}
                            alt=""
                            width={16}
                            height={16}
                          />
                        ) : null}
                        <span>{player.teamName}</span>
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="opgg-cell-rank">
                  {player.error ? (
                    <span className="player-error">{player.error}</span>
                  ) : (
                    <OpggRankCell
                      tier={player.tier}
                      rank={player.rank}
                      leaguePoints={player.leaguePoints}
                    />
                  )}
                </div>

                <div className="opgg-cell-winrate">
                  <WinratePills wins={player.wins} losses={player.losses} />
                </div>
              </div>
            ))
          : teams.map((team) => {
              const expanded = expandedTeamId === team.teamId;
              const teamWins = team.players.reduce((sum, p) => sum + (p.wins ?? 0), 0);
              const teamLosses = team.players.reduce((sum, p) => sum + (p.losses ?? 0), 0);

              return (
                <div className="opgg-team-group" key={team.teamId}>
                  <button
                    type="button"
                    className={`opgg-table-row opgg-table-row--team${expanded ? " opgg-table-row--expanded" : ""}`}
                    data-rank={team.position}
                    onClick={() =>
                      setExpandedTeamId((current) =>
                        current === team.teamId ? null : team.teamId
                      )
                    }
                    aria-expanded={expanded}
                  >
                    <span className="opgg-rank-num">{team.position}</span>

                    <div className="opgg-entity">
                      {team.logoUrl ? (
                        <Image
                          className="opgg-team-logo"
                          src={team.logoUrl}
                          alt=""
                          width={40}
                          height={40}
                        />
                      ) : (
                        <span className="opgg-team-logo opgg-team-logo--placeholder" />
                      )}
                      <div className="opgg-entity-text">
                        <span className="opgg-team-name">{team.fullName}</span>
                      </div>
                    </div>

                    <div className="opgg-cell-rank">
                      <OpggRankCell
                        tier={placementTier(team.position, teams.length)}
                        leaguePoints={team.totalScore}
                        showDivision={false}
                      />
                    </div>

                    <div className="opgg-cell-winrate">
                      <WinratePills wins={teamWins} losses={teamLosses} />
                    </div>
                  </button>

                  {expanded ? (
                    <div className="opgg-roster">
                      {team.players.map((player) => (
                          <div
                            className="opgg-table-row opgg-table-row--nested"
                            key={`${player.gameName}#${player.tagLine}`}
                          >
                            <span className="opgg-rank-num opgg-rank-num--nested">·</span>

                            <div className="opgg-entity">
                              <ProfileIcon profileIconId={player.profileIconId} size={36} />
                              <div className="opgg-entity-text">
                                <span className="opgg-player-name opgg-player-name--sm">
                                  {player.gameName}
                                  <span className="opgg-player-tag">
                                    #{player.tagLine}
                                  </span>
                                </span>
                              </div>
                            </div>

                            <div className="opgg-cell-rank">
                              {player.error ? (
                                <span className="player-error">{player.error}</span>
                              ) : (
                                <OpggRankCell
                                  tier={player.tier}
                                  rank={player.rank}
                                  leaguePoints={player.leaguePoints}
                                />
                              )}
                            </div>

                            <div className="opgg-cell-winrate">
                              <WinratePills wins={player.wins} losses={player.losses} />
                            </div>
                          </div>
                        ))}

                      {team.opggUrl ? (
                        <a
                          className="opgg-roster-link"
                          href={team.opggUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          View on OP.GG →
                        </a>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              );
            })}
      </div>
    </div>
  );
}
