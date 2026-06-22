import type { HistoryPoint } from "@/lib/db";
import { formatTimestamp } from "@/lib/format";
import type { HistoryChartPoint } from "@/lib/history-chart";

export function buildChartData(
  history: HistoryPoint[]
): { data: HistoryChartPoint[]; teams: string[] } {
  const teams = [...new Set(history.map((point) => point.teamName))].sort();
  const snapshots = [...new Set(history.map((point) => point.snapshotId))];

  const data = snapshots
    .map((snapshotId) => {
      const points = history.filter((point) => point.snapshotId === snapshotId);
      const createdAt = points[0]?.createdAt;
      if (!createdAt) {
        return null;
      }

      const row: HistoryChartPoint = {
        createdAt: formatTimestamp(createdAt),
        createdAtIso: createdAt,
      };

      for (const team of teams) {
        const match = points.find((point) => point.teamName === team);
        row[team] = match?.totalScore ?? 0;
      }

      return row;
    })
    .filter((row): row is HistoryChartPoint => row !== null);

  return { data, teams };
}
