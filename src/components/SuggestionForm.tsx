"use client";

import { useMemo, useState } from "react";
import { formatRiotId, playerDisplayName } from "@/lib/player-display";
import { TEAM_ROSTER_LIMIT } from "@/lib/rank";
import { PLAYER_ROLES, normalizeRole } from "@/lib/roles";
import { PlayerRoleBadge } from "@/components/PlayerRoleBadge";
import type { SuggestionType } from "@/lib/suggestions";

interface TeamOption {
  id: string;
  name: string;
  fullName: string;
  players: {
    gameName: string;
    tagLine: string;
    displayName?: string;
    role?: string | null;
    isActive?: boolean;
  }[];
}

interface SuggestionFormProps {
  teams: TeamOption[];
}

function playerKey(gameName: string, tagLine: string): string {
  return `${gameName}#${tagLine}`;
}

function playerOptionLabel(player: TeamOption["players"][number]): string {
  const label = playerDisplayName(player);
  const riotId = formatRiotId(player.gameName, player.tagLine);
  const roleSuffix = player.role ? ` · ${player.role}` : "";
  const statusSuffix = player.isActive ? "" : " · sub";
  const namePart = label === player.gameName ? riotId : `${label} (${riotId})`;
  return `${namePart}${roleSuffix}${statusSuffix}`;
}

function getActiveKeysForTeam(team: TeamOption | undefined): Set<string> {
  return new Set(
    (team?.players ?? [])
      .filter((player) => player.isActive)
      .map((player) => playerKey(player.gameName, player.tagLine))
  );
}

export function SuggestionForm({ teams }: SuggestionFormProps) {
  const [teamId, setTeamId] = useState(teams[0]?.id ?? "");
  const [suggestionType, setSuggestionType] = useState<SuggestionType>("add");
  const [gameName, setGameName] = useState("");
  const [tagLine, setTagLine] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState("");
  const [replacesGameName, setReplacesGameName] = useState("");
  const [replacesTagLine, setReplacesTagLine] = useState("");
  const [activeKeys, setActiveKeys] = useState<Set<string>>(() =>
    getActiveKeysForTeam(teams[0])
  );
  const [submitterNote, setSubmitterNote] = useState("");
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const selectedTeam = useMemo(
    () => teams.find((team) => team.id === teamId) ?? teams[0],
    [teamId, teams]
  );

  const isRoleChange = suggestionType === "change_role";
  const isRemove = suggestionType === "remove";
  const isReplace = suggestionType === "replace";
  const isSetActiveRoster = suggestionType === "set_active_roster";
  const isRosterPlayerSelect = isRoleChange || isRemove;

  function handleTeamChange(nextTeamId: string) {
    setTeamId(nextTeamId);
    const team = teams.find((entry) => entry.id === nextTeamId);
    setActiveKeys(getActiveKeysForTeam(team));
    setStatus("idle");
    setMessage("");
  }

  function handleSuggestionTypeChange(nextType: SuggestionType) {
    setSuggestionType(nextType);
    if (nextType === "set_active_roster") {
      setActiveKeys(getActiveKeysForTeam(selectedTeam));
    }
    setStatus("idle");
    setMessage("");
  }

  function handleReplacePlayerSelect(value: string) {
    const [name, tag] = value.split("#");
    setReplacesGameName(name ?? "");
    setReplacesTagLine(tag ?? "");
  }

  function handlePlayerSelect(value: string) {
    const [name, tag] = value.split("#");
    setGameName(name ?? "");
    setTagLine(tag ?? "");
  }

  function toggleActivePlayer(gameNameValue: string, tagLineValue: string) {
    const key = playerKey(gameNameValue, tagLineValue);
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

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const payload = isSetActiveRoster
        ? {
            teamId,
            suggestionType,
            activePlayers: (selectedTeam?.players ?? [])
              .filter((player) => activeKeys.has(playerKey(player.gameName, player.tagLine)))
              .map((player) => ({
                gameName: player.gameName,
                tagLine: player.tagLine,
              })),
            submitterNote: submitterNote || null,
            website,
          }
        : {
            teamId,
            gameName,
            tagLine,
            displayName: isRoleChange || isRemove ? null : displayName || null,
            role: isRemove ? null : role || null,
            suggestionType,
            replacesGameName: isReplace ? replacesGameName : null,
            replacesTagLine: isReplace ? replacesTagLine : null,
            submitterNote: submitterNote || null,
            website,
          };

      const response = await fetch("/api/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "Submission failed");
      }

      setStatus("success");
      setMessage("Thanks — your suggestion was sent for review.");
      setGameName("");
      setTagLine("");
      setDisplayName("");
      setRole("");
      setReplacesGameName("");
      setReplacesTagLine("");
      setActiveKeys(getActiveKeysForTeam(selectedTeam));
      setSubmitterNote("");
      setWebsite("");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Submission failed");
    }
  }

  return (
    <form className="suggestion-form" onSubmit={handleSubmit}>
      <div className="form-field">
        <label htmlFor="team">Team</label>
        <select
          id="team"
          value={teamId}
          onChange={(event) => handleTeamChange(event.target.value)}
          required
        >
          {teams.map((team) => (
            <option key={team.id} value={team.id}>
              {team.name} — {team.fullName}
            </option>
          ))}
        </select>
      </div>

      <div className="form-field">
        <span className="form-label">Suggestion type</span>
        <div className="form-radio-group">
          <label className="form-radio">
            <input
              type="radio"
              name="suggestionType"
              value="add"
              checked={suggestionType === "add"}
              onChange={() => handleSuggestionTypeChange("add")}
            />
            Add player
          </label>
          <label className="form-radio">
            <input
              type="radio"
              name="suggestionType"
              value="replace"
              checked={suggestionType === "replace"}
              onChange={() => handleSuggestionTypeChange("replace")}
            />
            Replace player
          </label>
          <label className="form-radio">
            <input
              type="radio"
              name="suggestionType"
              value="change_role"
              checked={suggestionType === "change_role"}
              onChange={() => handleSuggestionTypeChange("change_role")}
            />
            Change role
          </label>
          <label className="form-radio">
            <input
              type="radio"
              name="suggestionType"
              value="remove"
              checked={suggestionType === "remove"}
              onChange={() => handleSuggestionTypeChange("remove")}
            />
            Remove player
          </label>
          <label className="form-radio">
            <input
              type="radio"
              name="suggestionType"
              value="set_active_roster"
              checked={suggestionType === "set_active_roster"}
              onChange={() => handleSuggestionTypeChange("set_active_roster")}
            />
            Set active roster
          </label>
        </div>
      </div>

      {isSetActiveRoster ? (
        <div className="form-field suggestion-roster-field">
          <span className="form-label">Active roster ({TEAM_ROSTER_LIMIT} players)</span>
          <p className="suggestion-help">
            Select exactly {TEAM_ROSTER_LIMIT} players who should count toward the team score.
          </p>
          <div className="admin-roster-players">
            {selectedTeam?.players.map((player) => {
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
                    onChange={() => toggleActivePlayer(player.gameName, player.tagLine)}
                  />
                  <span className="admin-roster-player-main">
                    <span className="admin-roster-player-name">{playerDisplayName(player)}</span>
                    <span className="admin-roster-player-riot">
                      {formatRiotId(player.gameName, player.tagLine)}
                    </span>
                  </span>
                  <PlayerRoleBadge role={normalizeRole(player.role ?? "")} small />
                </label>
              );
            })}
          </div>
          <div className="suggestion-roster-footer">
            <span className="admin-roster-count">
              {activeKeys.size}/{TEAM_ROSTER_LIMIT} selected
            </span>
          </div>
        </div>
      ) : null}

      {isReplace ? (
        <div className="form-field">
          <label htmlFor="replacePlayer">Replace who?</label>
          <select
            id="replacePlayer"
            value={`${replacesGameName}#${replacesTagLine}`}
            onChange={(event) => handleReplacePlayerSelect(event.target.value)}
            required
          >
            <option value="#">Select current roster player</option>
            {selectedTeam?.players.map((player) => (
              <option
                key={`${player.gameName}#${player.tagLine}`}
                value={`${player.gameName}#${player.tagLine}`}
              >
                {playerOptionLabel(player)}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      {isRosterPlayerSelect ? (
        <div className="form-field">
          <label htmlFor="rosterPlayer">{isRemove ? "Remove who?" : "Player"}</label>
          <select
            id="rosterPlayer"
            value={`${gameName}#${tagLine}`}
            onChange={(event) => handlePlayerSelect(event.target.value)}
            required
          >
            <option value="#">Select roster player</option>
            {selectedTeam?.players.map((player) => (
              <option
                key={`${player.gameName}#${player.tagLine}`}
                value={`${player.gameName}#${player.tagLine}`}
              >
                {playerOptionLabel(player)}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      {!isRosterPlayerSelect && !isSetActiveRoster ? (
        <div className="form-row">
          <div className="form-field">
            <label htmlFor="gameName">Game name</label>
            <input
              id="gameName"
              value={gameName}
              onChange={(event) => setGameName(event.target.value)}
              placeholder="Summoner name"
              required
              maxLength={64}
            />
          </div>
          <div className="form-field">
            <label htmlFor="tagLine">Tag line</label>
            <input
              id="tagLine"
              value={tagLine}
              onChange={(event) => setTagLine(event.target.value)}
              placeholder="EUW"
              required
              maxLength={64}
            />
          </div>
        </div>
      ) : null}

      {!isRosterPlayerSelect && !isSetActiveRoster ? (
        <div className="form-field">
          <label htmlFor="displayName">Display name (optional)</label>
          <input
            id="displayName"
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            placeholder="Official player name — leave blank to use game name"
            maxLength={64}
          />
        </div>
      ) : null}

      {!isSetActiveRoster && !isRemove ? (
        <div className="form-field">
          <label htmlFor="role">{isRoleChange ? "New role" : "Role (optional)"}</label>
          <select
            id="role"
            value={role}
            onChange={(event) => setRole(event.target.value)}
            required={isRoleChange}
          >
            <option value="">{isRoleChange ? "Select role" : "No role"}</option>
            {PLAYER_ROLES.map((playerRole) => (
              <option key={playerRole} value={playerRole}>
                {playerRole}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      <div className="form-field">
        <label htmlFor="note">Note (optional)</label>
        <textarea
          id="note"
          value={submitterNote}
          onChange={(event) => setSubmitterNote(event.target.value)}
          placeholder={
            isSetActiveRoster
              ? "Why should this be the active roster?"
              : isRemove
                ? "Why should this player be removed from the roster?"
                : isRoleChange
                  ? "Why should this player's role be updated?"
                  : "Why should this account be on the roster?"
          }
          rows={3}
          maxLength={500}
        />
      </div>

      <div className="form-honeypot" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input
          id="website"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(event) => setWebsite(event.target.value)}
        />
      </div>

      <button className="form-submit" type="submit" disabled={status === "loading"}>
        {status === "loading" ? "Submitting…" : "Submit suggestion"}
      </button>

      {message ? (
        <p className={`form-message form-message--${status === "success" ? "success" : "error"}`}>
          {message}
        </p>
      ) : null}
    </form>
  );
}
