"use client";

import { useState } from "react";
import { formatRiotId, playerDisplayName } from "@/lib/player-display";
import { TEAM_ROSTER_LIMIT } from "@/lib/rank";
import { PlayerRoleBadge } from "@/components/PlayerRoleBadge";
import type { AdminTeamRoster } from "@/lib/roster";

interface AdminRosterPanelProps {
  initialRosters: AdminTeamRoster[];
}

function playerKey(gameName: string, tagLine: string): string {
  return `${gameName}#${tagLine}`;
}

export function AdminRosterPanel({ initialRosters }: AdminRosterPanelProps) {
  const [rosters, setRosters] = useState(initialRosters);
  const [selectedTeamId, setSelectedTeamId] = useState(initialRosters[0]?.teamId ?? "");
  const [activeKeys, setActiveKeys] = useState<Set<string>>(() => {
    const team = initialRosters[0];
    if (!team) {
      return new Set();
    }

    return new Set(
      team.players.filter((player) => player.isActive).map((player) => playerKey(player.gameName, player.tagLine))
    );
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const selectedTeam = rosters.find((team) => team.teamId === selectedTeamId) ?? rosters[0];

  function selectTeam(teamId: string) {
    setSelectedTeamId(teamId);
    const team = rosters.find((entry) => entry.teamId === teamId);
    setActiveKeys(
      new Set(
        (team?.players ?? [])
          .filter((player) => player.isActive)
          .map((player) => playerKey(player.gameName, player.tagLine))
      )
    );
    setStatus("idle");
    setMessage("");
  }

  function togglePlayer(gameName: string, tagLine: string) {
    const key = playerKey(gameName, tagLine);
    setActiveKeys((current) => {
      const next = new Set(current);
      if (next.has(key)) {
        next.delete(key);
        return next;
      }

      if (next.size >= TEAM_ROSTER_LIMIT) {
        return current;
      }

      next.add(key);
      return next;
    });
    setStatus("idle");
    setMessage("");
  }

  async function saveActiveRoster() {
    if (!selectedTeam) {
      return;
    }

    if (activeKeys.size !== TEAM_ROSTER_LIMIT) {
      setStatus("error");
      setMessage(`Select exactly ${TEAM_ROSTER_LIMIT} active players.`);
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const activePlayers = selectedTeam.players
        .filter((player) => activeKeys.has(playerKey(player.gameName, player.tagLine)))
        .map((player) => ({
          gameName: player.gameName,
          tagLine: player.tagLine,
        }));

      const response = await fetch("/api/admin/roster", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamId: selectedTeam.teamId,
          activePlayers,
        }),
      });

      const data = (await response.json()) as { error?: string; rosters?: AdminTeamRoster[] };

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to save active roster");
      }

      if (data.rosters) {
        setRosters(data.rosters);
        const updatedTeam = data.rosters.find((team) => team.teamId === selectedTeam.teamId);
        if (updatedTeam) {
          setActiveKeys(
            new Set(
              updatedTeam.players
                .filter((player) => player.isActive)
                .map((player) => playerKey(player.gameName, player.tagLine))
            )
          );
        }
      }

      setStatus("success");
      setMessage("Active roster saved.");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Failed to save active roster");
    }
  }

  if (!selectedTeam) {
    return <div className="empty-state">No teams found.</div>;
  }

  return (
    <div className="admin-roster-panel">
      <p className="admin-roster-help">
        Choose exactly {TEAM_ROSTER_LIMIT} players per team. Only the active roster counts toward the
        team score.
      </p>

      <div className="admin-roster-layout">
        <div className="admin-roster-teams">
          {rosters.map((team) => {
            const activeCount = team.players.filter((player) => player.isActive).length;
            return (
              <button
                key={team.teamId}
                type="button"
                className={`admin-roster-team${team.teamId === selectedTeam.teamId ? " admin-roster-team--active" : ""}`}
                onClick={() => selectTeam(team.teamId)}
              >
                <strong>{team.teamName}</strong>
                <span>
                  {activeCount}/{TEAM_ROSTER_LIMIT} active
                </span>
              </button>
            );
          })}
        </div>

        <div className="admin-roster-editor panel">
          <div className="panel-header">
            <h2>{selectedTeam.fullName}</h2>
          </div>
          <div className="panel-body panel-body--form">
            <div className="admin-roster-players">
              {selectedTeam.players.map((player) => {
                const key = playerKey(player.gameName, player.tagLine);
                const checked = activeKeys.has(key);
                const atLimit = activeKeys.size >= TEAM_ROSTER_LIMIT && !checked;

                return (
                  <label
                    key={key}
                    className={`admin-roster-player${checked ? " admin-roster-player--active" : ""}${atLimit ? " admin-roster-player--disabled" : ""}`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={atLimit}
                      onChange={() => togglePlayer(player.gameName, player.tagLine)}
                    />
                    <span className="admin-roster-player-main">
                      <span className="admin-roster-player-name">{playerDisplayName(player)}</span>
                      <span className="admin-roster-player-riot">
                        {formatRiotId(player.gameName, player.tagLine)}
                      </span>
                    </span>
                    <PlayerRoleBadge role={player.role ?? null} small />
                  </label>
                );
              })}
            </div>

            <div className="admin-roster-actions">
              <span className="admin-roster-count">
                {activeKeys.size}/{TEAM_ROSTER_LIMIT} selected
              </span>
              <button
                className="form-submit"
                type="button"
                disabled={status === "loading"}
                onClick={saveActiveRoster}
              >
                {status === "loading" ? "Saving…" : "Save active roster"}
              </button>
            </div>

            {message ? (
              <p className={`form-message form-message--${status === "success" ? "success" : "error"}`}>
                {message}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
