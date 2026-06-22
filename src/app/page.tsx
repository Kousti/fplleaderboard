import type { Metadata } from "next";
import { HomeTabs } from "@/components/HomeTabs";
import { buildChartData } from "@/lib/chart-data";
import { getDailyMoversPayload, getHistory, getLatestSnapshot } from "@/lib/db";
import { buildLeaderboardTeams, buildTeamMetaById } from "@/lib/team-meta";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "FPL Leaderboard",
  description: "Finnhouse ranked solo/duo team leaderboard with history and daily LP movers",
};

export default async function HomePage() {
  let snapshot: Awaited<ReturnType<typeof getLatestSnapshot>> = null;
  let history: Awaited<ReturnType<typeof getHistory>> = [];
  let moversPayload: Awaited<ReturnType<typeof getDailyMoversPayload>> = {
    period: "daily",
    availableDays: [],
    availableWeeks: [],
    selectedDay: null,
    selectedWeek: null,
    movers: null,
  };
  let error: string | null = null;

  try {
    [snapshot, history, moversPayload] = await Promise.all([
      getLatestSnapshot(),
      getHistory(100),
      getDailyMoversPayload(),
    ]);
  } catch (err) {
    error = err instanceof Error ? err.message : "Failed to load data";
  }

  const teamMetaMap = buildTeamMetaById();
  const teams = buildLeaderboardTeams(snapshot, teamMetaMap);
  const chart = buildChartData(history);
  const teamMetaById = Object.fromEntries(teamMetaMap);

  if (error) {
    return (
      <main className="page">
        <section className="panel">
          <div className="empty-state">{error}</div>
        </section>
      </main>
    );
  }

  return (
    <HomeTabs
      teams={teams}
      chartData={chart.data}
      chartTeams={chart.teams}
      moversPayload={moversPayload}
      teamMetaById={teamMetaById}
      lastUpdated={snapshot?.createdAt ?? null}
    />
  );
}
