"use client";

import { useEffect, useState, useTransition } from "react";
import Image from "next/image";
import { OpggRankCell } from "@/components/OpggRankCell";
import { ProfileIcon } from "@/components/ProfileIcon";
import type { MoverPeriod } from "@/lib/daily-movers";
import type { DailyMoversPayload, DailyPlayerMovers, PlayerDailyChange } from "@/lib/db";
import { formatHelsinkiDayOption, formatHelsinkiWeekOption } from "@/lib/helsinki-time";
import { formatScoreDelta } from "@/lib/rank";
import type { TeamMeta } from "@/lib/team-meta";

interface DailyMoverRowProps {
  position: number;
  entry: PlayerDailyChange;
  teamName: string;
  teamLogoUrl: string;
  direction: "up" | "down";
}

function DailyMoverRow({
  position,
  entry,
  teamName,
  teamLogoUrl,
  direction,
}: DailyMoverRowProps) {
  return (
    <div className="mover-row">
      <span className="mover-rank-num">{position}</span>
      <ProfileIcon profileIconId={entry.profileIconId} size={40} />

      <div className="mover-main">
        <div className="mover-name-line">
          <span className="opgg-player-name">
            {entry.gameName}
            <span className="opgg-player-tag">#{entry.tagLine}</span>
          </span>
        </div>

        <div className="mover-meta">
          <span className="mover-team">
            {teamLogoUrl ? (
              <Image className="mover-team-logo" src={teamLogoUrl} alt="" width={18} height={18} />
            ) : null}
            {teamName}
          </span>
        </div>

        <div className="mover-rank-change">
          <OpggRankCell
            tier={entry.previousTier}
            rank={entry.previousRank}
            leaguePoints={entry.previousLeaguePoints}
            emblemSize={36}
            muted
          />
          <span className="mover-rank-arrow" aria-hidden="true">
            →
          </span>
          <OpggRankCell
            tier={entry.tier}
            rank={entry.rank}
            leaguePoints={entry.leaguePoints}
            emblemSize={36}
          />
        </div>
      </div>

      <span className={`mover-delta mover-delta--${direction}`}>
        {formatScoreDelta(entry.change)}
      </span>
    </div>
  );
}

interface DailyMoversPanelProps {
  title: string;
  entries: PlayerDailyChange[];
  direction: "up" | "down";
  teamMetaById: Record<string, TeamMeta>;
  emptyMessage: string;
}

function DailyMoversPanel({
  title,
  entries,
  direction,
  teamMetaById,
  emptyMessage,
}: DailyMoversPanelProps) {
  return (
    <section className={`panel movers-panel movers-panel--${direction}`}>
      <div className="panel-header">
        <h2>{title}</h2>
      </div>
      <div className="panel-body movers-body">
        {entries.length ? (
          <div className="movers-list">
            {entries.map((entry, index) => {
              const meta = teamMetaById[entry.teamId];
              return (
                <DailyMoverRow
                  key={`${entry.gameName}#${entry.tagLine}`}
                  position={index + 1}
                  entry={entry}
                  teamName={meta?.fullName ?? meta?.teamName ?? entry.teamId}
                  teamLogoUrl={meta?.logoUrl ?? ""}
                  direction={direction}
                />
              );
            })}
          </div>
        ) : (
          <div className="empty-state movers-empty">{emptyMessage}</div>
        )}
      </div>
    </section>
  );
}

interface DailyMoversProps {
  initialPayload: DailyMoversPayload;
  teamMetaById: Record<string, TeamMeta>;
}

const PERIOD_OPTIONS: { id: MoverPeriod; label: string }[] = [
  { id: "daily", label: "Day" },
  { id: "weekly", label: "Week" },
];

function moversMatchSelection(
  movers: DailyPlayerMovers | null,
  period: MoverPeriod,
  selectedDay: string | null,
  selectedWeek: string | null
): boolean {
  if (!movers || movers.period !== period) {
    return false;
  }

  if (period === "daily") {
    return movers.periodKey === selectedDay;
  }

  return movers.periodKey === selectedWeek;
}

export function DailyMovers({ initialPayload, teamMetaById }: DailyMoversProps) {
  const [period, setPeriod] = useState<MoverPeriod>(initialPayload.period);
  const [availableDays, setAvailableDays] = useState(initialPayload.availableDays);
  const [availableWeeks, setAvailableWeeks] = useState(initialPayload.availableWeeks);
  const [selectedDay, setSelectedDay] = useState(initialPayload.selectedDay);
  const [selectedWeek, setSelectedWeek] = useState(initialPayload.selectedWeek);
  const [movers, setMovers] = useState<DailyPlayerMovers | null>(initialPayload.movers);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (moversMatchSelection(movers, period, selectedDay, selectedWeek)) {
      return;
    }

    startTransition(async () => {
      setError(null);
      try {
        const params = new URLSearchParams({ period });
        if (period === "daily" && selectedDay) {
          params.set("day", selectedDay);
        }
        if (period === "weekly" && selectedWeek) {
          params.set("week", selectedWeek);
        }

        const response = await fetch(`/api/daily-movers?${params.toString()}`);
        const payload = (await response.json()) as DailyMoversPayload & { error?: string };

        if (!response.ok) {
          throw new Error(payload.error ?? "Failed to load movers");
        }

        setAvailableDays(payload.availableDays);
        setAvailableWeeks(payload.availableWeeks);
        setSelectedDay(payload.selectedDay);
        setSelectedWeek(payload.selectedWeek);
        setMovers(payload.movers);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load movers");
      }
    });
  }, [movers, period, selectedDay, selectedWeek]);

  const emptyMessage =
    period === "daily"
      ? !availableDays.length
        ? "Daily changes appear after the first full day has ended."
        : movers
          ? "No LP changes on the selected day."
          : "No comparable snapshots found for the selected day."
      : !availableWeeks.length
        ? "Weekly changes appear after the first full week (Mon–Sun) has ended."
        : movers
          ? "No LP changes on the selected week."
          : "No comparable snapshots found for the selected week.";

  const gainersTitle =
    period === "daily" ? "Top daily gainers" : "Top weekly gainers";
  const losersTitle =
    period === "daily" ? "Top daily losers" : "Top weekly losers";

  return (
    <div className={`movers-section${isPending ? " movers-section--loading" : ""}`}>
      <div className="movers-toolbar">
        <div className="movers-period-tabs" role="group" aria-label="Period">
          {PERIOD_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              className={`movers-period-tab${period === option.id ? " movers-period-tab--active" : ""}`}
              onClick={() => {
                setPeriod(option.id);
                setMovers(null);
              }}
              aria-pressed={period === option.id}
            >
              {option.label}
            </button>
          ))}
        </div>

        {period === "daily" ? (
          <label className="movers-day-picker">
            <span className="movers-day-picker-label">Day</span>
            <select
              className="movers-day-picker-select"
              value={selectedDay ?? ""}
              onChange={(event) => setSelectedDay(event.target.value || null)}
              disabled={!availableDays.length || isPending}
            >
              {!availableDays.length ? <option value="">No days yet</option> : null}
              {availableDays.map((dayKey) => (
                <option key={dayKey} value={dayKey}>
                  {formatHelsinkiDayOption(dayKey)}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <label className="movers-day-picker">
            <span className="movers-day-picker-label">Week</span>
            <select
              className="movers-day-picker-select"
              value={selectedWeek ?? ""}
              onChange={(event) => setSelectedWeek(event.target.value || null)}
              disabled={!availableWeeks.length || isPending}
            >
              {!availableWeeks.length ? <option value="">No weeks yet</option> : null}
              {availableWeeks.map((weekKey) => (
                <option key={weekKey} value={weekKey}>
                  {formatHelsinkiWeekOption(weekKey)}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      {error ? <div className="empty-state movers-empty">{error}</div> : null}

      <div className="movers-grid">
        <DailyMoversPanel
          title={gainersTitle}
          entries={movers?.gainers ?? []}
          direction="up"
          teamMetaById={teamMetaById}
          emptyMessage={emptyMessage}
        />
        <DailyMoversPanel
          title={losersTitle}
          entries={movers?.losers ?? []}
          direction="down"
          teamMetaById={teamMetaById}
          emptyMessage={emptyMessage}
        />
      </div>
    </div>
  );
}
