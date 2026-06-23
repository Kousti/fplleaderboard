"use client";

import { useState } from "react";
import { ProfileIcon } from "@/components/ProfileIcon";
import { PlayerNameDisplay } from "@/components/PlayerNameDisplay";
import { PlayerRoleBadge } from "@/components/PlayerRoleBadge";
import { formatRiotId, playerDisplayName } from "@/lib/player-display";
import { formatTimestamp } from "@/lib/format";
import { formatRank } from "@/lib/rank";
import type { PlayerSuggestion } from "@/lib/suggestions";
import { getTeamById } from "@/lib/teams";

interface AdminPanelProps {
  initialSuggestions: PlayerSuggestion[];
}

function formatPreview(suggestion: PlayerSuggestion): string {
  if (!suggestion.previewTier) {
    return "Unranked";
  }

  return formatRank({
    tier: suggestion.previewTier,
    rank: suggestion.previewRank,
    leaguePoints: suggestion.previewLeaguePoints ?? 0,
    wins: 0,
    losses: 0,
  });
}

function SuggestionCard({
  suggestion,
  onReviewed,
}: {
  suggestion: PlayerSuggestion;
  onReviewed: (updated: PlayerSuggestion) => void;
}) {
  const [adminNote, setAdminNote] = useState("");
  const [status, setStatus] = useState<"idle" | "loading">("idle");
  const [error, setError] = useState("");

  const team = getTeamById(suggestion.teamId);
  const isActiveRosterSuggestion = suggestion.suggestionType === "set_active_roster";

  async function review(decision: "approved" | "rejected") {
    setStatus("loading");
    setError("");

    try {
      const response = await fetch(`/api/admin/suggestions/${suggestion.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          decision,
          adminNote: adminNote || null,
        }),
      });

      const data = (await response.json()) as {
        error?: string;
        suggestion?: PlayerSuggestion;
      };

      if (!response.ok || !data.suggestion) {
        throw new Error(data.error ?? "Review failed");
      }

      onReviewed(data.suggestion);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Review failed");
      setStatus("idle");
    }
  }

  return (
    <article className={`admin-card admin-card--${suggestion.status}`}>
      <div className="admin-card-header">
        <div className="admin-card-player">
          {!isActiveRosterSuggestion ? (
            <ProfileIcon profileIconId={suggestion.profileIconId} size={44} />
          ) : null}
          <div>
            {isActiveRosterSuggestion ? (
              <>
                <strong>{team?.fullName ?? suggestion.teamId}</strong>
                <div className="admin-card-meta">Proposed active roster</div>
              </>
            ) : (
              <>
                <div className="opgg-player-line">
                  <PlayerNameDisplay
                    displayName={suggestion.displayName}
                    gameName={suggestion.gameName}
                    tagLine={suggestion.tagLine}
                  />
                  <PlayerRoleBadge role={suggestion.role} />
                </div>
                <div className="admin-card-meta">{formatPreview(suggestion)}</div>
              </>
            )}
          </div>
        </div>
        <span className={`admin-status admin-status--${suggestion.status}`}>
          {suggestion.status}
        </span>
      </div>

      <dl className="admin-card-details">
        <div>
          <dt>Team</dt>
          <dd>{team?.name ?? suggestion.teamId}</dd>
        </div>
        <div>
          <dt>Type</dt>
          <dd>
            {suggestion.suggestionType === "add"
              ? "Add player"
              : suggestion.suggestionType === "replace"
                ? `Replace ${suggestion.replacesGameName}#${suggestion.replacesTagLine}`
                : suggestion.suggestionType === "change_role"
                  ? `Change role to ${suggestion.role ?? "—"}`
                  : "Set active roster"}
          </dd>
        </div>
        {!isActiveRosterSuggestion ? (
          <div>
            <dt>Role</dt>
            <dd>{suggestion.role ?? "—"}</dd>
          </div>
        ) : null}
        <div>
          <dt>Submitted</dt>
          <dd>{formatTimestamp(suggestion.createdAt)}</dd>
        </div>
        {isActiveRosterSuggestion && suggestion.activeRoster?.length ? (
          <div className="admin-card-roster-list">
            <dt>Active players</dt>
            <dd>
              <ul>
                {suggestion.activeRoster.map((player) => (
                  <li key={`${player.gameName}#${player.tagLine}`}>
                    {playerDisplayName(player)} ({formatRiotId(player.gameName, player.tagLine)})
                  </li>
                ))}
              </ul>
            </dd>
          </div>
        ) : null}
        {suggestion.submitterNote ? (
          <div>
            <dt>Note</dt>
            <dd>{suggestion.submitterNote}</dd>
          </div>
        ) : null}
        {suggestion.reviewedAt ? (
          <div>
            <dt>Reviewed</dt>
            <dd>{formatTimestamp(suggestion.reviewedAt)}</dd>
          </div>
        ) : null}
        {suggestion.adminNote ? (
          <div>
            <dt>Admin note</dt>
            <dd>{suggestion.adminNote}</dd>
          </div>
        ) : null}
      </dl>

      {suggestion.status === "pending" ? (
        <div className="admin-card-actions">
          <input
            className="admin-note-input"
            value={adminNote}
            onChange={(event) => setAdminNote(event.target.value)}
            placeholder="Optional note (shown on reject)"
            maxLength={500}
          />
          <div className="admin-card-buttons">
            <button
              className="form-submit form-submit--approve"
              type="button"
              disabled={status === "loading"}
              onClick={() => review("approved")}
            >
              Approve
            </button>
            <button
              className="form-submit form-submit--reject"
              type="button"
              disabled={status === "loading"}
              onClick={() => review("rejected")}
            >
              Reject
            </button>
          </div>
          {error ? <p className="form-message form-message--error">{error}</p> : null}
        </div>
      ) : null}
    </article>
  );
}

export function AdminPanel({ initialSuggestions }: AdminPanelProps) {
  const [suggestions, setSuggestions] = useState(initialSuggestions);
  const [filter, setFilter] = useState<"pending" | "all">("pending");

  const visibleSuggestions =
    filter === "pending"
      ? suggestions.filter((suggestion) => suggestion.status === "pending")
      : suggestions;

  function handleReviewed(updated: PlayerSuggestion) {
    setSuggestions((current) =>
      current.map((suggestion) => (suggestion.id === updated.id ? updated : suggestion))
    );
  }

  return (
    <div className="admin-panel">
      <div className="admin-toolbar admin-toolbar--nested">
        <div className="chart-segmented">
          <button
            className={`chart-segment ${filter === "pending" ? "chart-segment--active" : ""}`}
            type="button"
            onClick={() => setFilter("pending")}
          >
            Pending
          </button>
          <button
            className={`chart-segment ${filter === "all" ? "chart-segment--active" : ""}`}
            type="button"
            onClick={() => setFilter("all")}
          >
            All
          </button>
        </div>
      </div>

      {visibleSuggestions.length === 0 ? (
        <div className="empty-state">
          {filter === "pending" ? "No pending suggestions." : "No suggestions yet."}
        </div>
      ) : (
        <div className="admin-list">
          {visibleSuggestions.map((suggestion) => (
            <SuggestionCard
              key={suggestion.id}
              suggestion={suggestion}
              onReviewed={handleReviewed}
            />
          ))}
        </div>
      )}
    </div>
  );
}
