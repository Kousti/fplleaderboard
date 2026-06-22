"use client";

import { useState } from "react";
import { DailyMovers } from "@/components/DailyMovers";
import { HistoryChart, type HistoryChartPoint } from "@/components/HistoryChart";
import { Leaderboard, type LeaderboardTeam } from "@/components/Leaderboard";
import type { DailyMoversPayload } from "@/lib/db";
import { formatTimestamp } from "@/lib/format";
import type { TeamMeta } from "@/lib/team-meta";

type HomeTab = "leaderboard" | "risers";

interface HomeTabsProps {
  teams: LeaderboardTeam[];
  chartData: HistoryChartPoint[];
  chartTeams: string[];
  moversPayload: DailyMoversPayload;
  teamMetaById: Record<string, TeamMeta>;
  lastUpdated: string | null;
}

const TABS: { id: HomeTab; label: string }[] = [
  { id: "leaderboard", label: "Leaderboard" },
  { id: "risers", label: "Risers & Fallers" },
];

export function HomeTabs({
  teams,
  chartData,
  chartTeams,
  moversPayload,
  teamMetaById,
  lastUpdated,
}: HomeTabsProps) {
  const [tab, setTab] = useState<HomeTab>("leaderboard");

  return (
    <main className="page">
      <section className="hero">
        <div>
          <h1>FPL Leaderboard</h1>
          {tab === "risers" ? (
            <p>
              Largest player LP changes for the selected day or week (Mon–Sun, Helsinki). Current
              day and week results are published only after the period has ended.
            </p>
          ) : null}
        </div>
        <div className="meta">
          {tab === "leaderboard" ? (
            lastUpdated ? (
              <>
                Last updated
                <br />
                {formatTimestamp(lastUpdated)}
              </>
            ) : (
              <>Waiting for first snapshot</>
            )
          ) : null}
        </div>
      </section>

      <div className="home-tabs">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`home-tab${tab === item.id ? " home-tab--active" : ""}`}
            onClick={() => setTab(item.id)}
            aria-pressed={tab === item.id}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === "leaderboard" ? (
        <>
          <section className="panel">
            <div className="panel-header">
              <h2>Standings</h2>
            </div>
            <div className="panel-body">
              <Leaderboard teams={teams} />
            </div>
          </section>

          <section className="panel panel--chart">
            <div className="panel-header">
              <h2>History</h2>
            </div>
            <div className="panel-body panel-body--chart">
              <HistoryChart data={chartData} teams={chartTeams} />
            </div>
          </section>
        </>
      ) : (
        <DailyMovers initialPayload={moversPayload} teamMetaById={teamMetaById} />
      )}
    </main>
  );
}
